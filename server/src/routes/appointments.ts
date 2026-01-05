import { Hono } from 'hono';
import { db, appointments } from '../db';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const appointmentsRoutes = new Hono();
appointmentsRoutes.use('*', authMiddleware);

appointmentsRoutes.get('/', async (c) => {
    const authUser = c.get('user');
    const result = await db.query.appointments.findMany({
        where: eq(appointments.userId, authUser.id),
        orderBy: (appointments, { desc }) => [desc(appointments.dateTime)],
    });
    return c.json({ appointments: result });
});

appointmentsRoutes.get('/:id', async (c) => {
    const authUser = c.get('user');
    const id = c.req.param('id');

    const appointment = await db.query.appointments.findFirst({
        where: and(eq(appointments.id, id), eq(appointments.userId, authUser.id)),
    });

    if (!appointment) return c.json({ error: 'Appointment not found' }, 404);
    return c.json({ appointment });
});

appointmentsRoutes.post('/', async (c) => {
    try {
        const authUser = c.get('user');
        const body = await c.req.json();

        const [newAppt] = await db.insert(appointments).values({
            userId: authUser.id,
            title: body.title,
            doctorName: body.doctorName,
            location: body.location,
            dateTime: new Date(body.dateTime),
            type: body.type,
            status: body.status || 'scheduled',
            notes: body.notes,
        }).returning();

        return c.json({ appointment: newAppt }, 201);
    } catch (error) {
        console.error('Add appointment error:', error);
        return c.json({ error: 'Failed to add appointment' }, 500);
    }
});

appointmentsRoutes.patch('/:id', async (c) => {
    try {
        const authUser = c.get('user');
        const id = c.req.param('id');
        const body = await c.req.json();

        if (body.dateTime) body.dateTime = new Date(body.dateTime);

        const [updated] = await db.update(appointments)
            .set({ ...body, updatedAt: new Date() })
            .where(and(eq(appointments.id, id), eq(appointments.userId, authUser.id)))
            .returning();

        if (!updated) return c.json({ error: 'Appointment not found' }, 404);
        return c.json({ appointment: updated });
    } catch (error) {
        console.error('Update appointment error:', error);
        return c.json({ error: 'Failed to update appointment' }, 500);
    }
});

appointmentsRoutes.delete('/:id', async (c) => {
    const authUser = c.get('user');
    const id = c.req.param('id');
    await db.delete(appointments).where(and(eq(appointments.id, id), eq(appointments.userId, authUser.id)));
    return c.json({ success: true });
});

export default appointmentsRoutes;
