import express from 'express';
import cors from 'cors';
import licenceRoutes from './modules/licences/routes';
import complaintRoutes from './modules/complaints/routes';

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

// 4. Manual Stats Route (This fuels the 4 KPI cards at the top of your dashboard)
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    activeLicences: 154, 
    activeLicencesDelta: 5,
    complaintsYTD: 24,
    complaintsYTDDelta: -2,
    mobileSubscribers: 2841,
    mobileSubscribersDelta: 12
  });
});

// 5. Notification Placeholder (Stops the 404 console spam)
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/', (req, res) => res.send('BOCRA API LIVE'));

export default app;
