import path from "path";
// import { defineConfig } from "@prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

export default {
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    async adapter() {
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
      return new PrismaPg(pool as unknown as any);
    },
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
};