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
exports.expiringSoonLicences = exports.pendingLicences = exports.recentLicences = exports.removeLicence = exports.applyForLicence = exports.getLicenceById = exports.myApplications = exports.licenceStats = exports.updateStatus = exports.listLicences = void 0;
const service_1 = require("./service");
function mapLicence(lic) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return {
        id: lic.id,
        licenceNumber: lic.id,
        holderName: (_a = lic.companyName) !== null && _a !== void 0 ? _a : 'Unknown',
        category: (_b = lic.type) !== null && _b !== void 0 ? _b : 'Unknown',
        status: (_c = lic.status) !== null && _c !== void 0 ? _c : 'unknown',
        region: (_d = lic.region) !== null && _d !== void 0 ? _d : 'Gaborone', // Vital for the Dashboard Map
        issuedAt: (_e = lic.createdAt) !== null && _e !== void 0 ? _e : null,
        expiresAt: (_f = lic.expiresAt) !== null && _f !== void 0 ? _f : null,
        conditions: (_g = lic.conditions) !== null && _g !== void 0 ? _g : {},
        documentUrl: (_h = lic.documentUrl) !== null && _h !== void 0 ? _h : null,
    };
}
const listLicences = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q, category, status, page, limit } = req.query;
        const data = yield (0, service_1.getAllLicences)({
            search: q,
            type: category,
            status,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 15,
        });
        res.json({
            data: data.results.map(mapLicence),
            total: data.total,
            page: data.page,
            limit: data.limit,
            totalPages: data.totalPages,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.listLicences = listLicences;
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        if (!status)
            return res.status(400).json({ success: false, error: 'status is required' });
        const data = yield (0, service_1.updateLicenceStatus)(String(req.params.id), status);
        res.json({ success: true, data: mapLicence(data) });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.updateStatus = updateStatus;
const licenceStats = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getLicenceStats)();
        // Formatting for the Frontend KPI Cards
        res.json({
            success: true,
            data: {
                activeLicences: data.total || 0,
                activeLicencesDelta: 5,
                complaintsYTD: 12, // Placeholder until complaints module is linked
                complaintsYTDDelta: -2,
                mobileSubscribers: 2841,
                mobileSubscribersDelta: 156
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.licenceStats = licenceStats;
// Keep existing exports...
const myApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const data = yield (0, service_1.getAllLicences)({ userId, page: 1, limit: 50 });
        res.json({ success: true, data: data.results.map(mapLicence) });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.myApplications = myApplications;
const getLicenceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getLicence)(String(req.params.id));
        res.json({ success: true, data: mapLicence(data) });
    }
    catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});
exports.getLicenceById = getLicenceById;
const applyForLicence = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type, category, companyName } = req.body;
        const licenceType = type || category;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const data = yield (0, service_1.createLicence)({ type: licenceType, companyName, userId });
        const mapped = mapLicence(data);
        res.status(201).json({ success: true, data: mapped, reference: mapped.id });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.applyForLicence = applyForLicence;
const removeLicence = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.deleteLicence)(String(req.params.id));
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.removeLicence = removeLicence;
const recentLicences = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 5;
        const data = yield (0, service_1.getRecentLicences)(limit);
        res.json({ success: true, data: data.map(mapLicence) });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.recentLicences = recentLicences;
const pendingLicences = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getPendingLicences)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.pendingLicences = pendingLicences;
const expiringSoonLicences = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getExpiringSoonLicences)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.expiringSoonLicences = expiringSoonLicences;
