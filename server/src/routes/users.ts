import { Hono } from 'hono';
import { z } from 'zod';
import { db, users, allergies, conditions, emergencyContacts } from '../db';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const usersRoutes = new Hono();

// All routes require authentication
usersRoutes.use('*', authMiddleware);

// Update profile schema
const updateProfileSchema = z.object({
    name: z.string().min(1).optional(),
    dob: z.string().optional(),
    bloodType: z.string().optional(),
    organDonor: z.boolean().optional(),
    importantNotes: z.string().optional(),
    isOnboardingComplete: z.boolean().optional(),
});

/**
 * PATCH /api/users/profile
 * Update current user's profile
 */
usersRoutes.patch('/profile', async (c) => {
    try {
        const authUser = c.get('user');
        const body = await c.req.json();
        const data = updateProfileSchema.parse(body);

        const [updated] = await db.update(users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(users.id, authUser.id))
            .returning();

        const { passwordHash, ...userWithoutPassword } = updated;
        return c.json({ user: userWithoutPassword });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Update profile error:', error);
        return c.json({ error: 'Failed to update profile' }, 500);
    }
});

/**
 * GET /api/users/allergies
 */
usersRoutes.get('/allergies', async (c) => {
    const authUser = c.get('user');
    const result = await db.query.allergies.findMany({
        where: eq(allergies.userId, authUser.id),
    });
    return c.json({ allergies: result });
});

/**
 * POST /api/users/allergies
 */
usersRoutes.post('/allergies', async (c) => {
    try {
        const authUser = c.get('user');
        const body = await c.req.json();

        const [newAllergy] = await db.insert(allergies).values({
            userId: authUser.id,
            name: body.name,
            severity: body.severity,
            notes: body.notes,
        }).returning();

        return c.json({ allergy: newAllergy }, 201);
    } catch (error) {
        console.error('Add allergy error:', error);
        return c.json({ error: 'Failed to add allergy' }, 500);
    }
});

/**
 * DELETE /api/users/allergies/:id
 */
usersRoutes.delete('/allergies/:id', async (c) => {
    const authUser = c.get('user');
    const id = c.req.param('id');

    // Use and() to combine both conditions - chained .where() would replace the first
    await db.delete(allergies)
        .where(and(eq(allergies.id, id), eq(allergies.userId, authUser.id)));

    return c.json({ success: true });
});

/**
 * GET /api/users/conditions
 */
usersRoutes.get('/conditions', async (c) => {
    const authUser = c.get('user');
    const result = await db.query.conditions.findMany({
        where: eq(conditions.userId, authUser.id),
    });
    return c.json({ conditions: result });
});

/**
 * POST /api/users/conditions
 */
usersRoutes.post('/conditions', async (c) => {
    try {
        const authUser = c.get('user');
        const body = await c.req.json();

        const [newCondition] = await db.insert(conditions).values({
            userId: authUser.id,
            name: body.name,
            diagnosedDate: body.diagnosedDate,
            status: body.status || 'active',
            notes: body.notes,
        }).returning();

        return c.json({ condition: newCondition }, 201);
    } catch (error) {
        console.error('Add condition error:', error);
        return c.json({ error: 'Failed to add condition' }, 500);
    }
});

/**
 * GET /api/users/emergency-contacts
 */
usersRoutes.get('/emergency-contacts', async (c) => {
    const authUser = c.get('user');
    const result = await db.query.emergencyContacts.findMany({
        where: eq(emergencyContacts.userId, authUser.id),
    });
    return c.json({ emergencyContacts: result });
});

/**
 * POST /api/users/emergency-contacts
 */
usersRoutes.post('/emergency-contacts', async (c) => {
    try {
        const authUser = c.get('user');
        const body = await c.req.json();

        const [newContact] = await db.insert(emergencyContacts).values({
            userId: authUser.id,
            name: body.name,
            phone: body.phone,
            relationship: body.relationship,
            isPrimary: body.isPrimary || false,
        }).returning();

        return c.json({ emergencyContact: newContact }, 201);
    } catch (error) {
        console.error('Add emergency contact error:', error);
        return c.json({ error: 'Failed to add emergency contact' }, 500);
    }
});

export default usersRoutes;
