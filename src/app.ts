import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/routes'; 
import licenceRoutes from './modules/licences/routes';
import complaintRoutes from './modules/complaints/routes';
import analyticsRoutes from './modules/analytics/routes'; 
import documentRoutes from './modules/documents/routes'; 

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes); 
app.use('/api/licences', licenceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/documents', documentRoutes); 

app.use('/api/admin/licences', licenceRoutes);
app.use('/api/admin/complaints', complaintRoutes);

app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: [] });
});

export default app;
