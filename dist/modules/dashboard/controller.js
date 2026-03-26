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
exports.recentActivity = exports.filterComplaints = exports.expiringLicences = exports.userActivitySummary = exports.licenceApprovalRate = exports.resolutionTime = exports.dailyComplaints = exports.topProviders = exports.complaintResolutionRate = exports.monthlyTrends = exports.licencesBySector = exports.complaintsByProvider = exports.complaintsByCategory = exports.dashboardSummary = exports.dashboardStats = void 0;
const service_1 = require("./service");
const dashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getDashboardStats)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.dashboardStats = dashboardStats;
const dashboardSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getDashboardSummary)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.dashboardSummary = dashboardSummary;
const complaintsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getComplaintsByCategory)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.complaintsByCategory = complaintsByCategory;
const complaintsByProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getComplaintsByProvider)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.complaintsByProvider = complaintsByProvider;
const licencesBySector = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getLicencesBySector)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.licencesBySector = licencesBySector;
const monthlyTrends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getMonthlyTrends)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.monthlyTrends = monthlyTrends;
const complaintResolutionRate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getComplaintResolutionRate)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.complaintResolutionRate = complaintResolutionRate;
const topProviders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getTopProviders)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.topProviders = topProviders;
const dailyComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getDailyComplaintsLast7Days)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.dailyComplaints = dailyComplaints;
const resolutionTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getResolutionTime)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.resolutionTime = resolutionTime;
const licenceApprovalRate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getLicenceApprovalRate)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.licenceApprovalRate = licenceApprovalRate;
const userActivitySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getUserActivitySummary)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.userActivitySummary = userActivitySummary;
const expiringLicences = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getExpiringLicences)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.expiringLicences = expiringLicences;
const filterComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { provider, category, status } = req.query;
        const data = yield (0, service_1.searchComplaints)({ provider, category, status });
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.filterComplaints = filterComplaints;
const recentActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, service_1.getRecentActivity)();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.recentActivity = recentActivity;
