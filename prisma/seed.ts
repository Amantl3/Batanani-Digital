import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.complaint.createMany({
    data: [
      { refNumber: "BOC-2026-001", category: "Internet", provider: "BTC", description: "Slow internet speeds in Gaborone West", userId: "demo-user", status: "open" },
      { refNumber: "BOC-2026-002", category: "Mobile", provider: "Mascom", description: "No signal in Block 8", userId: "demo-user", status: "resolved" },
      { refNumber: "BOC-2026-003", category: "TV", provider: "DSTV", description: "Channels not working after payment", userId: "demo-user", status: "in-progress" },
    ]
  });
  console.log("Seed data added successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());