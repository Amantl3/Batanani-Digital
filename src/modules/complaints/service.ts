import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createComplaint = async (data: {
  category: string;
  provider: string;
  description: string;
  userId: string;
}) => {
  const refNumber = `BOC-${Date.now()}`;
  return await prisma.complaint.create({
    data: { ...data, refNumber },
  });
};

export const getComplaintByRef = async (refNumber: string) => {
  return await prisma.complaint.findUnique({ where: { refNumber } });
};

export const getAllComplaints = async () => {
  return await prisma.complaint.findMany({ orderBy: { createdAt: "desc" } });
};