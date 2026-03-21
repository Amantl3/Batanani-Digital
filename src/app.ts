import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { supabase } from "./config/supabase";
import dashboardRoutes from "./modules/dashboard/routes";
import licenceRoutes from "./modules/licences/routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/licences", licenceRoutes);

app.get("/", (req, res) => {
  res.json({ message: "BOCRA API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/test-supabase", async (req, res) => {
  const { data, error } = await supabase.from("Complaint").select("*").limit(1);
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, message: "Supabase connected", data });
});

export default app;