import express from 'express';
import cors from 'cors';
import licenceRoutes from './modules/licences/routes';
import complaintRoutes from './modules/complaints/routes';
import analyticsRoutes from './modules/analytics/routes'; 

const app = express();

// This is the "Handshake" that allows the frontend to talk to the backend
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite frontend port
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/licences', licenceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/licences', licenceRoutes);
app.use('/api/admin/complaints', complaintRoutes);

app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: [] });
});

export default app;
