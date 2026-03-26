"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getMyComplaints = exports.recentComplaints = exports.complaintsByProvider = exports.complaintsByCategory = exports.trackComplaintByRef = exports.getComplaint = exports.complaintStats = exports.updateStatus = exports.createComplaint = exports.listComplaints = void 0;
const service = __importStar(require("./service"));
function mapComplaint(c) {
    return {
        id: c.id,
        refNumber: c.refNumber || c.id.slice(0, 8),
        category: c.category || 'General',
        provider: c.provider || 'Unknown',
        region: c.region || 'Gaborone',
        status: c.status || 'pending',
        createdAt: c.createdAt,
        description: c.description
    };
}
const listComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q, category, status, page, limit } = req.query;
        const data = yield service.getAllComplaints({
            search: q,
            category: category,
            status: status,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 1000,
        });
        res.json({
            success: true,
            data: data.results.map(mapComplaint),
            total: data.total
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.listComplaints = listComplaints;
const createComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const data = yield service.createComplaint(Object.assign(Object.assign({}, req.body), { userId }));
        res.status(201).json({ success: true, data: mapComplaint(data) });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.createComplaint = createComplaint;
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // FIX: String() ensures we don't pass string[] to the service
        const data = yield service.updateComplaintStatus(String(req.params.id), req.body.status);
        res.json({ success: true, data: mapComplaint(data) });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.updateStatus = updateStatus;
const complaintStats = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getComplaintStats();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.complaintStats = complaintStats;
// Placeholders to satisfy routes.ts
const getComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () { res.json({ success: true }); });
exports.getComplaint = getComplaint;
const trackComplaintByRef = (req, res) => __awaiter(void 0, void 0, void 0, function* () { res.json({ success: true }); });
exports.trackComplaintByRef = trackComplaintByRef;
const complaintsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () { res.json({ success: true }); });
exports.complaintsByCategory = complaintsByCategory;
const complaintsByProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () { res.json({ success: true }); });
exports.complaintsByProvider = complaintsByProvider;
const recentComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () { res.json({ success: true }); });
exports.recentComplaints = recentComplaints;
const getMyComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () { res.json({ success: true }); });
exports.getMyComplaints = getMyComplaints;
