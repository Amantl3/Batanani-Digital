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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:3001",
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;