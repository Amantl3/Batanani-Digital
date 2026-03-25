import { PrismaClient } from '@prisma/client'


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
  const count = await prisma.document.count()
  if (count > 0) return { message: 'Already seeded' }

  await prisma.document.createMany({
    data: [
      {
        title:    'Draft Cybersecurity Policy for Electronic Communications Networks',
        category: 'consultation',
        summary:  'BOCRA invites public comment on the draft cybersecurity policy framework for electronic communications network operators in Botswana.',
        fileUrl:  'https://www.bocra.org.bw/sites/default/files/documents/BoCRA%20Annual%20Report%202019-20_0.pdf',
        fileName: 'cybersecurity-policy-draft.pdf',
        fileSize: '1.2 MB',
        featured: true,
      },
      {
        title:    'Q4 2024 Market Monitoring and Competition Report',
        category: 'report',
        summary:  'Quarterly analysis of market trends, subscriber statistics, and competition indicators across all communications sectors.',
        fileUrl:  'https://www.bocra.org.bw/sites/default/files/documents/BoCRA%20Annual%20Report%202019-20_0.pdf',
        fileName: 'q4-2024-market-report.pdf',
        fileSize: '3.4 MB',
        featured: true,
      },
      {
        title:    'Telecommunications (Amendment) Regulations 2025 — Draft',
        category: 'consultation',
        summary:  'Proposed amendments to the existing telecommunications regulations to address emerging digital services and OTT providers.',
        fileUrl:  'https://www.bocra.org.bw/sites/default/files/documents/BoCRA%20Annual%20Report%202019-20_0.pdf',
        fileName: 'telecom-amendment-2025.pdf',
        fileSize: '890 KB',
        featured: false,
      },
      {
        title:    'Revised Type Approval Guidelines for Mobile Devices',
        category: 'regulation',
        summary:  'Updated technical requirements and submission procedures for type approval of mobile handsets and accessories.',
        fileUrl:  'https://www.bocra.org.bw/sites/default/files/documents/BoCRA%20Annual%20Report%202019-20_0.pdf',
        fileName: 'type-approval-guidelines.pdf',
        fileSize: '560 KB',
        featured: false,
      },
      {
        title:    'Government Gazette — BOCRA Licence Fee Schedule 2025/26',
        category: 'gazette',
        summary:  'Official gazette notice setting out the annual licence fees for all categories of communications licences.',
        fileUrl:  'https://www.bocra.org.bw/sites/default/files/documents/BoCRA%20Annual%20Report%202019-20_0.pdf',
        fileName: 'licence-fee-schedule-2025.pdf',
        fileSize: '440 KB',
        featured: false,
      },
      {
        title:    'CSIRT Advisory: Phishing Campaign Targeting Mobile Banking Users',
        category: 'advisory',
        summary:  'Security alert regarding active phishing campaigns impersonating major Botswana banks via SMS and WhatsApp.',
        fileUrl:  'https://www.bocra.org.bw/sites/default/files/documents/BoCRA%20Annual%20Report%202019-20_0.pdf',
        fileName: 'csirt-phishing-advisory.pdf',
        fileSize: '210 KB',
        featured: false,
      },
      {
        title:    'Annual Report 2023/24',
        category: 'report',
        summary:  "BOCRA's comprehensive annual report covering regulatory activities, financial statements, and strategic priorities.",
        fileUrl:  'https://www.bocra.org.bw/sites/default/files/documents/BoCRA%20Annual%20Report%202019-20_0.pdf',
        fileName: 'annual-report-2023-24.pdf',
        fileSize: '8.7 MB',
        featured: false,
      },
      {
        title:    'Broadband Strategy for Botswana 2025–2030',
        category: 'regulation',
        summary:  'National strategy document outlining targets for broadband penetration, infrastructure investment, and digital inclusion.',
        fileUrl:  'https://www.bocra.org.bw/sites/default/files/documents/BoCRA%20Annual%20Report%202019-20_0.pdf',
        fileName: 'broadband-strategy-2025-2030.pdf',
        fileSize: '2.1 MB',
        featured: false,
      },
    ],
  })

  return { message: 'Seeded successfully' }
}