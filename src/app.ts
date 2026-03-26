import express from 'express';
import cors from 'cors';
import licenceRoutes from './modules/licences/routes';
import complaintRoutes from './modules/complaints/routes';
import analyticsRoutes from './modules/analytics/routes'; 


const app = express();

// 1. Fix CORS once and for all
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// 2. Map existing modules to the paths the frontend is calling
app.use('/api/licences', licenceRoutes);
app.use('/api/complaints', complaintRoutes);

// 3. Admin Aliases (Frontend calls these specifically)
app.use('/api/admin/licences', licenceRoutes);
app.use('/api/admin/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
// 3. Dummy Notifications route to stop the 404 spam in your console
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/', (req, res) => res.send('BOCRA API LIVE'));

export default app;
