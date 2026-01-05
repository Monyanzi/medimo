import { Hono } from 'hono';
import { db, documents } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const documentsRoutes = new Hono();
documentsRoutes.use('*', authMiddleware);

documentsRoutes.get('/', async (c) => {
    const authUser = c.get('user');
    const category = c.req.query('category');

    let query = eq(documents.userId, authUser.id);

    const result = await db.query.documents.findMany({
        where: category
            ? and(query, eq(documents.category, category))
            : query,
        orderBy: [desc(documents.uploadDate)],
    });
    return c.json({ documents: result });
});

documentsRoutes.post('/', async (c) => {
    try {
        const authUser = c.get('user');
        const body = await c.req.json();

        const [newDoc] = await db.insert(documents).values({
            userId: authUser.id,
            fileName: body.fileName,
            fileType: body.fileType,
            storagePath: body.storagePath,
            category: body.category,
            fileSize: body.fileSize,
            description: body.description,
            tags: body.tags,
        }).returning();

        return c.json({ document: newDoc }, 201);
    } catch (error) {
        console.error('Add document error:', error);
        return c.json({ error: 'Failed to add document' }, 500);
    }
});

documentsRoutes.delete('/:id', async (c) => {
    const authUser = c.get('user');
    const id = c.req.param('id');
    await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, authUser.id)));
    return c.json({ success: true });
});

export default documentsRoutes;
