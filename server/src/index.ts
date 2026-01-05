import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

// Import routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import medicationsRoutes from './routes/medications';
import appointmentsRoutes from './routes/appointments';
import vitalsRoutes from './routes/vitals';
import documentsRoutes from './routes/documents';
import timelineRoutes from './routes/timeline';
import emergencyRoutes from './routes/emergency';

// Create the Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
}));

// Health check
app.get('/', (c) => c.json({
    status: 'ok',
    name: 'Medimo API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
}));

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/medications', medicationsRoutes);
app.route('/api/appointments', appointmentsRoutes);
app.route('/api/vitals', vitalsRoutes);
app.route('/api/documents', documentsRoutes);
app.route('/api/timeline', timelineRoutes);

// Public emergency profile - no auth required (for QR code scanning)
app.route('/emergency', emergencyRoutes);

// Error handling
app.onError((err, c) => {
    console.error('Server error:', err);
    return c.json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, 500);
});

// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404);
});

// Start server
const port = parseInt(process.env.PORT || '3001');
console.log(`🚀 Medimo API starting on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});
