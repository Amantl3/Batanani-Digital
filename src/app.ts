import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/routes'; 
import licenceRoutes from './modules/licences/routes';
import complaintRoutes from './modules/complaints/routes';
import analyticsRoutes from './modules/analytics/routes'; 

const app = express();

// 1. CORS Setup (Allows your local frontend to talk to this backend)
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

// 2. Authentication and Core Routes
app.use('/api/auth', authRoutes); 
app.use('/api/licences', licenceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);

// 3. Admin Redirects
app.use('/api/admin/licences', licenceRoutes);
app.use('/api/admin/complaints', complaintRoutes);

// 4. FIX: Added the /api/documents route to stop the 404 error
app.get('/api/documents', (req, res) => {
  // If you have a document module later, replace this with documentRoutes
  res.json({ 
    success: true, 
    data: [
      {
        id: '1',
        title: 'BOCRA Annual Report 2025',
        category: 'report',
        publishedAt: new Date().toISOString(),
        fileSize: '2.4 MB',
        summary: 'Overview of telecommunications landscape in Botswana.',
        fileUrl: '#',
        featured: true
      },
      {
        id: '2',
        title: 'New Spectrum Regulation Notice',
        category: 'regulation',
        publishedAt: new Date().toISOString(),
        fileSize: '1.1 MB',
        summary: 'Official updates regarding radio frequency allocations.',
        fileUrl: '#',
        featured: false
      }
    ] 
  });
});

app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: [] });
});

export default app;
