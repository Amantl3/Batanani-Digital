import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/routes'; 
import licenceRoutes from './modules/licences/routes';
import complaintRoutes from './modules/complaints/routes';
import analyticsRoutes from './modules/analytics/routes'; 
import documentRoutes from './modules/documents/routes'; 

const app = express();


  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Core Routes
app.use('/api/auth', authRoutes); 
app.use('/api/licences', licenceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/documents', documentRoutes); 

// Admin Redirects
app.use('/api/admin/licences', licenceRoutes);
app.use('/api/admin/complaints', complaintRoutes);

app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: [] });
});

// Error handling to prevent Status 500 crashes
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something broke!', message: err.message });
});

export default app;
