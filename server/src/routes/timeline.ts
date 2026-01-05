import { Hono } from 'hono';
import { db, timelineEvents } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const timelineRoutes = new Hono();
timelineRoutes.use('*', authMiddleware);

timelineRoutes.get('/', async (c) => {
    const authUser = c.get('user');
    const category = c.req.query('category');
    const limit = parseInt(c.req.query('limit') || '100');

    let whereClause = eq(timelineEvents.userId, authUser.id);

    const result = await db.query.timelineEvents.findMany({
        where: category && category !== 'all'
            ? and(whereClause, eq(timelineEvents.category, category))
            : whereClause,
        orderBy: [desc(timelineEvents.date)],
        limit,
    });
    return c.json({ events: result });
});

timelineRoutes.post('/', async (c) => {
    try {
        const authUser = c.get('user');
        const body = await c.req.json();

        const [newEvent] = await db.insert(timelineEvents).values({
            userId: authUser.id,
            title: body.title,
            details: body.details,
            date: new Date(body.date || Date.now()),
            category: body.category,
            relatedId: body.relatedId,
            notes: body.notes,
            isSystem: body.isSystem || false,
            systemType: body.systemType,
        }).returning();

        return c.json({ event: newEvent }, 201);
    } catch (error) {
        console.error('Add timeline event error:', error);
        return c.json({ error: 'Failed to add timeline event' }, 500);
    }
});

timelineRoutes.patch('/:id', async (c) => {
    try {
        const authUser = c.get('user');
        const id = c.req.param('id');
        const body = await c.req.json();

        if (body.date) body.date = new Date(body.date);

        const [updated] = await db.update(timelineEvents)
            .set(body)
            .where(and(eq(timelineEvents.id, id), eq(timelineEvents.userId, authUser.id)))
            .returning();

        if (!updated) return c.json({ error: 'Event not found' }, 404);
        return c.json({ event: updated });
    } catch (error) {
        console.error('Update timeline event error:', error);
        return c.json({ error: 'Failed to update timeline event' }, 500);
    }
});

timelineRoutes.delete('/:id', async (c) => {
    const authUser = c.get('user');
    const id = c.req.param('id');
    await db.delete(timelineEvents).where(and(eq(timelineEvents.id, id), eq(timelineEvents.userId, authUser.id)));
    return c.json({ success: true });
});

export default timelineRoutes;
