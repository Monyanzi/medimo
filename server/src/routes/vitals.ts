import { Hono } from 'hono';
import { db, vitalSigns } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const vitalsRoutes = new Hono();
vitalsRoutes.use('*', authMiddleware);

vitalsRoutes.get('/', async (c) => {
    const authUser = c.get('user');
    const limit = parseInt(c.req.query('limit') || '100');

    const result = await db.query.vitalSigns.findMany({
        where: eq(vitalSigns.userId, authUser.id),
        orderBy: [desc(vitalSigns.recordedDate)],
        limit,
    });
    return c.json({ vitals: result });
});

vitalsRoutes.post('/', async (c) => {
    try {
        const authUser = c.get('user');
        const body = await c.req.json();

        const [newVital] = await db.insert(vitalSigns).values({
            userId: authUser.id,
            bloodPressureSystolic: body.bloodPressureSystolic,
            bloodPressureDiastolic: body.bloodPressureDiastolic,
            heartRate: body.heartRate,
            weight: body.weight,
            height: body.height,
            temperature: body.temperature,
            oxygenSaturation: body.oxygenSaturation,
            respiratoryRate: body.respiratoryRate,
            bloodGlucose: body.bloodGlucose,
            recordedDate: new Date(body.recordedDate || Date.now()),
            notes: body.notes,
        }).returning();

        return c.json({ vital: newVital }, 201);
    } catch (error) {
        console.error('Add vital signs error:', error);
        return c.json({ error: 'Failed to add vital signs' }, 500);
    }
});

vitalsRoutes.patch('/:id', async (c) => {
    try {
        const authUser = c.get('user');
        const id = c.req.param('id');
        const body = await c.req.json();

        if (body.recordedDate) body.recordedDate = new Date(body.recordedDate);

        const [updated] = await db.update(vitalSigns)
            .set(body)
            .where(and(eq(vitalSigns.id, id), eq(vitalSigns.userId, authUser.id)))
            .returning();

        if (!updated) return c.json({ error: 'Vital signs not found' }, 404);
        return c.json({ vital: updated });
    } catch (error) {
        console.error('Update vital signs error:', error);
        return c.json({ error: 'Failed to update vital signs' }, 500);
    }
});

vitalsRoutes.delete('/:id', async (c) => {
    const authUser = c.get('user');
    const id = c.req.param('id');
    await db.delete(vitalSigns).where(and(eq(vitalSigns.id, id), eq(vitalSigns.userId, authUser.id)));
    return c.json({ success: true });
});

export default vitalsRoutes;
