import { Hono } from 'hono';
import { db, medications } from '../db';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const medicationsRoutes = new Hono();
medicationsRoutes.use('*', authMiddleware);

/**
 * GET /api/medications
 * Get all medications for current user
 */
medicationsRoutes.get('/', async (c) => {
    const authUser = c.get('user');
    const result = await db.query.medications.findMany({
        where: eq(medications.userId, authUser.id),
        orderBy: (medications, { desc }) => [desc(medications.createdAt)],
    });
    return c.json({ medications: result });
});

/**
 * GET /api/medications/:id
 */
medicationsRoutes.get('/:id', async (c) => {
    const authUser = c.get('user');
    const id = c.req.param('id');

    const medication = await db.query.medications.findFirst({
        where: and(
            eq(medications.id, id),
            eq(medications.userId, authUser.id)
        ),
    });

    if (!medication) {
        return c.json({ error: 'Medication not found' }, 404);
    }

    return c.json({ medication });
});

/**
 * POST /api/medications
 */
medicationsRoutes.post('/', async (c) => {
    try {
        const authUser = c.get('user');
        const body = await c.req.json();

        const [newMedication] = await db.insert(medications).values({
            userId: authUser.id,
            name: body.name,
            dosage: body.dosage,
            frequency: body.frequency,
            instructions: body.instructions,
            prescribedBy: body.prescribedBy,
            startDate: body.startDate,
            endDate: body.endDate,
            status: body.status || 'active',
            notes: body.notes,
        }).returning();

        return c.json({ medication: newMedication }, 201);
    } catch (error) {
        console.error('Add medication error:', error);
        return c.json({ error: 'Failed to add medication' }, 500);
    }
});

/**
 * PATCH /api/medications/:id
 */
medicationsRoutes.patch('/:id', async (c) => {
    try {
        const authUser = c.get('user');
        const id = c.req.param('id');
        const body = await c.req.json();

        // Whitelist allowed updatable fields - never accept id, userId, createdAt
        const allowedFields = ['name', 'dosage', 'frequency', 'instructions', 'prescribedBy', 'startDate', 'endDate', 'status', 'notes'];
        const updateData: Record<string, unknown> = { updatedAt: new Date() };

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        const [updated] = await db.update(medications)
            .set(updateData)
            .where(and(
                eq(medications.id, id),
                eq(medications.userId, authUser.id)
            ))
            .returning();

        if (!updated) {
            return c.json({ error: 'Medication not found' }, 404);
        }

        return c.json({ medication: updated });
    } catch (error) {
        console.error('Update medication error:', error);
        return c.json({ error: 'Failed to update medication' }, 500);
    }
});

/**
 * DELETE /api/medications/:id
 */
medicationsRoutes.delete('/:id', async (c) => {
    const authUser = c.get('user');
    const id = c.req.param('id');

    await db.delete(medications)
        .where(and(
            eq(medications.id, id),
            eq(medications.userId, authUser.id)
        ));

    return c.json({ success: true });
});

export default medicationsRoutes;
