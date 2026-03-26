"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDocuments = getAllDocuments;
exports.getDocumentById = getDocumentById;
exports.seedDocuments = seedDocuments;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getAllDocuments() {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.document.findMany({
            orderBy: { publishedAt: 'desc' },
        });
    });
}
function getDocumentById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.document.findUnique({ where: { id } });
    });
}
function seedDocuments() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check count to prevent duplicates
        const count = yield prisma.document.count();
        if (count > 0) {
            return {
                message: 'Database already contains data. Please "DELETE FROM Document" in Supabase SQL Editor to refresh.',
                count
            };
        }
        const documents = [
            {
                title: 'State of ICTs in Botswana – Communications Facts & Figures',
                category: 'report',
                summary: "BOCRA's annual Communications Facts & Figures report covering telecoms, postal, and broadcasting sector performance.",
                fileUrl: 'https://hvbxwiamktzxrispbqfj.supabase.co/storage/v1/object/public/documents/BOCRA%20for%20State%20of%20ICTs%20in%20Botswana.pdf',
                fileName: 'BOCRA_for_State_of_ICTs_in_Botswana.pdf',
                fileSize: '~4 MB',
                featured: true,
                publishedAt: new Date('2024-12-01'),
            },
            {
                title: 'Consumer Protection Policy - Communications Sector',
                category: 'regulation',
                summary: 'Guidelines and policy framework ensuring the protection of consumer rights within the Botswana communications industry.',
                fileUrl: 'https://hvbxwiamktzxrispbqfj.supabase.co/storage/v1/object/public/documents/Consumer_Protection_Policy_-_Communications_Sector.pdf',
                fileName: 'Consumer_Protection_Policy.pdf',
                fileSize: '1.2 MB',
                featured: false,
                publishedAt: new Date('2025-01-15'),
            },
            {
                title: 'Register of Licensed Operators',
                category: 'gazette',
                summary: 'Official list of all licensed service providers in the telecommunications, postal, and broadcasting sectors.',
                fileUrl: 'https://hvbxwiamktzxrispbqfj.supabase.co/storage/v1/object/public/documents/LICENSED_OPERATORS.pdf',
                fileName: 'LICENSED_OPERATORS.pdf',
                fileSize: '850 KB',
                featured: false,
                publishedAt: new Date('2025-03-01'),
            },
            {
                title: 'Preamble to the Cybersecurity Bill (Revised)',
                category: 'consultation',
                summary: 'An introductory overview and strategic framework for the proposed national Cybersecurity Bill for Botswana.',
                fileUrl: 'https://hvbxwiamktzxrispbqfj.supabase.co/storage/v1/object/public/documents/Preamble_to_the_Cybersecurity_Bill_Revised.pdf',
                fileName: 'Cybersecurity_Bill_Preamble.pdf',
                fileSize: '2.1 MB',
                featured: true,
                publishedAt: new Date('2025-02-10'),
            },
            {
                title: 'UASF Annual Report 2024/25',
                category: 'report',
                summary: 'Annual performance and financial report for the Universal Access and Service Fund (UASF).',
                fileUrl: 'https://hvbxwiamktzxrispbqfj.supabase.co/storage/v1/object/public/documents/UASF_Annual_Report_2024_25_WEB.pdf',
                fileName: 'UASF_Annual_Report_2024.pdf',
                fileSize: '5.4 MB',
                featured: false,
                publishedAt: new Date('2025-03-20'),
            }
        ];
        yield prisma.document.createMany({
            data: documents,
        });
        return {
            message: 'Seeded successfully!',
            count: documents.length
        };
    });
}
