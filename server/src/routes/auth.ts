import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db, users } from '../db';
import { eq } from 'drizzle-orm';
import { generateToken, authMiddleware } from '../middleware/auth';

const auth = new Hono();

// Validation schemas
const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/register
 * Create a new user account
 */
auth.post('/register', async (c) => {
    try {
        const body = await c.req.json();
        const data = registerSchema.parse(body);

        // Normalize email to lowercase for case-insensitive matching
        const normalizedEmail = data.email.toLowerCase();

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
        });

        if (existingUser) {
            return c.json({ error: 'Email already registered' }, 400);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10);

        // Create user with normalized email
        const [newUser] = await db.insert(users).values({
            name: data.name,
            email: normalizedEmail,
            passwordHash,
        }).returning();

        // Generate token
        const token = generateToken({ id: newUser.id, email: newUser.email });

        return c.json({
            success: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                isOnboardingComplete: newUser.isOnboardingComplete,
            },
            token,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Registration error:', error);
        return c.json({ error: 'Registration failed' }, 500);
    }
});

/**
 * POST /api/auth/login
 * Authenticate and get token
 */
auth.post('/login', async (c) => {
    try {
        const body = await c.req.json();
        const data = loginSchema.parse(body);

        // Normalize email to lowercase for case-insensitive matching
        const normalizedEmail = data.email.toLowerCase();

        // Find user with normalized email
        const user = await db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
        });

        if (!user) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValidPassword) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // Generate token
        const token = generateToken({ id: user.id, email: user.email });

        return c.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                dob: user.dob,
                bloodType: user.bloodType,
                organDonor: user.organDonor,
                importantNotes: user.importantNotes,
                isOnboardingComplete: user.isOnboardingComplete,
            },
            token,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Login error:', error);
        return c.json({ error: 'Login failed' }, 500);
    }
});

/**
 * GET /api/auth/me
 * Get current user profile (protected)
 */
auth.get('/me', authMiddleware, async (c) => {
    try {
        const authUser = c.get('user');

        const user = await db.query.users.findFirst({
            where: eq(users.id, authUser.id),
            with: {
                emergencyContacts: true,
                allergies: true,
                conditions: true,
            },
        });

        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Don't return passwordHash
        const { passwordHash, ...userWithoutPassword } = user;

        return c.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Get profile error:', error);
        return c.json({ error: 'Failed to get profile' }, 500);
    }
});

export default auth;
