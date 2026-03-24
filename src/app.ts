import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { supabase } from "./config/supabase";
import dashboardRoutes from "./modules/dashboard/routes";
import licenceRoutes from "./modules/licences/routes";
import complaintRoutes from "./modules/complaints/routes";
import authRoutes from "./modules/auth/routes";
import chatRoutes from "./modules/chat/routes";
import documentRoutes from './modules/documents/routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:5173",
    "https://batanani-digital-production.up.railway.app"
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:5173",
    "https://batanani-digital-production.up.railway.app"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/", (req, res) => {
  res.json({ message: "BOCRA API is running" });
});

app.get("/api/test-supabase", async (req, res) => {
  const { data, error } = await supabase.from("Complaint").select("*").limit(1);
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, message: "Supabase connected", data });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/licences", licenceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;