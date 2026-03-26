import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/routes'; 
import licenceRoutes from './modules/licences/routes';
import complaintRoutes from './modules/complaints/routes';
import analyticsRoutes from './modules/analytics/routes'; 

const app = express();

// Updated CORS to allow all the ports your local computer might use
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'https://batanani-digital-production.up.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/licences', licenceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/licences', licenceRoutes);
app.use('/api/admin/complaints', complaintRoutes);

app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: [] });
});

export default app;
