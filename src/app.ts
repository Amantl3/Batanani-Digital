import express from 'express';
import cors from 'cors';
import licenceRoutes from './modules/licences/routes';
import complaintRoutes from './modules/complaints/routes';
// If you have a notifications module, import it here:
// import notificationRoutes from './modules/notifications/routes';

const app = express();

// 1. Enable CORS so your frontend can talk to Railway
app.use(cors({
  origin: '*', // For demo purposes, allows all origins
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. Map the routes to the exact paths the frontend expects
app.use('/api/licences', licenceRoutes);
app.use('/api/admin/licences', licenceRoutes); 
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin/complaints', complaintRoutes);

// 3. Dummy Notifications route to stop the 404 spam in your console
app.get('/api/notifications', (req, res) => {
  res.json({ data: [], success: true });
});

// Health check
app.get('/', (req, res) => res.send('BOCRA System API Running'));

export default app;