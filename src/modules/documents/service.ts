import { PrismaClient } from '@prisma/client'

// This line defines 'prisma' so the errors on Line 3 and 27 go away
const prisma = new PrismaClient()

export async function getAllDocuments() {
  return prisma.document.findMany({
    orderBy: { publishedAt: 'desc' },
  })
}

export async function getDocumentById(id: string) {
  return prisma.document.findUnique({ where: { id } })
}

export async function seedDocuments() {
  // 1. Check if we already have documents
  const count = await prisma.document.count()
  
  if (count > 0) {
    return { 
      message: 'Database already contains data.',
      count 
    }
  }

  // 2. Define the data
  const documents = [
    {
      title: 'State of ICTs in Botswana – Communications Facts & Figures',
      category: 'report',
      summary: "BOCRA's annual Communications Facts & Figures report covering telecoms, postal, and broadcasting sector performance, subscriptions, quality of service, and digital transformation initiatives.",
      fileUrl: 'https://hvbxwiamktzxrispbqfj.supabase.co/storage/v1/object/public/documents/BOCRA%20for%20State%20of%20ICTs%20in%20Botswana.pdf',
      fileName: 'BOCRA_for_State_of_ICTs_in_Botswana.pdf',
      fileSize: '~4 MB',
      featured: true,
      publishedAt: new Date('2024-12-01'),
    },
  ]

  // 3. Insert into DB
  await prisma.document.createMany({
    data: documents,
  })

  return { 
    message: 'Seeded successfully!',
    count: documents.length 
  }
}