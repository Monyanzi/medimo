import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

// Use environment variable with development fallback
// In production, JWT_SECRET MUST be set to a secure value
const JWT_SECRET = process.env.JWT_SECRET || 'medimo-dev-secret-change-in-production';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET environment variable is required in production');
    process.exit(1);
} else if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET not set, using insecure development default');
}

export interface AuthUser {
    id: string;
    email: string;
}

// Extend Hono context with user
declare module 'hono' {
    interface ContextVariableMap {
        user: AuthUser;
    }
}

/**
 * Authentication middleware - validates JWT and adds user to context
 * All protected routes must use this middleware
 */
export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        c.set('user', decoded);
        await next();
    } catch (error) {
        return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }
};

/**
 * Generate a JWT token for a user
 */
export const generateToken = (user: AuthUser): string => {
    return jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Verify a JWT token and return the user
 */
export const verifyToken = (token: string): AuthUser | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthUser;
    } catch {
        return null;
    }
};
