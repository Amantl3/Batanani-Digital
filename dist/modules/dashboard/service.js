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
exports.getRecentActivity = exports.searchComplaints = exports.getExpiringLicences = exports.getUserActivitySummary = exports.getLicenceApprovalRate = exports.getResolutionTime = exports.getDailyComplaintsLast7Days = exports.getTopProviders = exports.getComplaintResolutionRate = exports.getMonthlyTrends = exports.getLicencesBySector = exports.getComplaintsByProvider = exports.getComplaintsByCategory = exports.getDashboardSummary = exports.getDashboardStats = void 0;
const supabase_1 = require("../../config/supabase");
// ── 1. Main stats overview ────────────────────────────────────────────
const getDashboardStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const [{ count: totalComplaints }, { count: openComplaints }, { count: resolvedComplaints }, { count: totalLicences }, { count: pendingLicences }, { count: approvedLicences }, { count: unreadNotifications }, { data: recentComplaints }, { data: recentLicences },] = yield Promise.all([
        supabase_1.supabase.from("Complaint").select("*", { count: "exact", head: true }),
        supabase_1.supabase.from("Complaint").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase_1.supabase.from("Complaint").select("*", { count: "exact", head: true }).eq("status", "resolved"),
        supabase_1.supabase.from("Licence").select("*", { count: "exact", head: true }),
        supabase_1.supabase.from("Licence").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase_1.supabase.from("Licence").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase_1.supabase.from("Notification").select("*", { count: "exact", head: true }).eq("read", false),
        supabase_1.supabase.from("Complaint").select("*").order("createdAt", { ascending: false }).limit(5),
        supabase_1.supabase.from("Licence").select("*").order("createdAt", { ascending: false }).limit(5),
    ]);
    return {
        complaints: {
            total: totalComplaints !== null && totalComplaints !== void 0 ? totalComplaints : 0,
            open: openComplaints !== null && openComplaints !== void 0 ? openComplaints : 0,
            resolved: resolvedComplaints !== null && resolvedComplaints !== void 0 ? resolvedComplaints : 0,
        },
        licences: {
            total: totalLicences !== null && totalLicences !== void 0 ? totalLicences : 0,
            pending: pendingLicences !== null && pendingLicences !== void 0 ? pendingLicences : 0,
            approved: approvedLicences !== null && approvedLicences !== void 0 ? approvedLicences : 0,
        },
        notifications: {
            unread: unreadNotifications !== null && unreadNotifications !== void 0 ? unreadNotifications : 0,
        },
        recentComplaints: recentComplaints !== null && recentComplaints !== void 0 ? recentComplaints : [],
        recentLicences: recentLicences !== null && recentLicences !== void 0 ? recentLicences : [],
    };
});
exports.getDashboardStats = getDashboardStats;
// ── 2. Dashboard summary (metric cards) ──────────────────────────────
const getDashboardSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1).toISOString();
    const prevYearStart = new Date(currentYear - 1, 0, 1).toISOString();
    const prevYearEnd = new Date(currentYear - 1, 11, 31).toISOString();
    const quarterStart = new Date(currentYear, Math.floor(new Date().getMonth() / 3) * 3, 1).toISOString();
    const [{ count: activeLicences }, { count: newThisQuarter }, { count: complaintsYTD }, { count: prevYearComplaints }, { count: totalComplaints }, { count: resolvedComplaints }, { count: unreadNotifications },] = yield Promise.all([
        supabase_1.supabase.from("Licence").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase_1.supabase.from("Licence").select("*", { count: "exact", head: true }).gte("createdAt", quarterStart),
        supabase_1.supabase.from("Complaint").select("*", { count: "exact", head: true }).gte("createdAt", yearStart),
        supabase_1.supabase.from("Complaint").select("*", { count: "exact", head: true }).gte("createdAt", prevYearStart).lte("createdAt", prevYearEnd),
        supabase_1.supabase.from("Complaint").select("*", { count: "exact", head: true }),
        supabase_1.supabase.from("Complaint").select("*", { count: "exact", head: true }).eq("status", "resolved"),
        supabase_1.supabase.from("Notification").select("*", { count: "exact", head: true }).eq("read", false),
    ]);
    const ytdCount = complaintsYTD !== null && complaintsYTD !== void 0 ? complaintsYTD : 0;
    const prevCount = prevYearComplaints !== null && prevYearComplaints !== void 0 ? prevYearComplaints : 0;
    const totalCount = totalComplaints !== null && totalComplaints !== void 0 ? totalComplaints : 0;
    const resolvedCount = resolvedComplaints !== null && resolvedComplaints !== void 0 ? resolvedComplaints : 0;
    const complaintChangeVsLastYear = prevCount > 0
        ? (((ytdCount - prevCount) / prevCount) * 100).toFixed(1) + "%"
        : "N/A";
    const resolutionRate = totalCount > 0
        ? ((resolvedCount / totalCount) * 100).toFixed(1) + "%"
        : "0%";
    return {
        activeLicences: {
            value: activeLicences !== null && activeLicences !== void 0 ? activeLicences : 0,
            newThisQuarter: newThisQuarter !== null && newThisQuarter !== void 0 ? newThisQuarter : 0,
            trend: (newThisQuarter !== null && newThisQuarter !== void 0 ? newThisQuarter : 0) > 0 ? "up" : "stable",
        },
        complaintsYTD: {
            value: ytdCount,
            changeVsLastYear: complaintChangeVsLastYear,
            trend: ytdCount < prevCount ? "down" : "up",
        },
        resolutionRate: {
            value: resolutionRate,
            totalResolved: resolvedCount,
            totalComplaints: totalCount,
        },
        notifications: {
            unread: unreadNotifications !== null && unreadNotifications !== void 0 ? unreadNotifications : 0,
        },
    };
});
exports.getDashboardSummary = getDashboardSummary;
// ── 3. Complaints by category ─────────────────────────────────────────
const getComplaintsByCategory = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { data, error } = yield supabase_1.supabase.from("Complaint").select("category");
    if (error)
        throw new Error(error.message);
    const grouped = {};
    for (const item of data !== null && data !== void 0 ? data : []) {
        grouped[item.category] = ((_a = grouped[item.category]) !== null && _a !== void 0 ? _a : 0) + 1;
    }
    return Object.entries(grouped)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
});
exports.getComplaintsByCategory = getComplaintsByCategory;
// ── 4. Complaints by provider ─────────────────────────────────────────
const getComplaintsByProvider = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { data, error } = yield supabase_1.supabase.from("Complaint").select("provider");
    if (error)
        throw new Error(error.message);
    const grouped = {};
    for (const item of data !== null && data !== void 0 ? data : []) {
        grouped[item.provider] = ((_a = grouped[item.provider]) !== null && _a !== void 0 ? _a : 0) + 1;
    }
    return Object.entries(grouped)
        .map(([provider, count]) => ({ provider, count }))
        .sort((a, b) => b.count - a.count);
});
exports.getComplaintsByProvider = getComplaintsByProvider;
// ── 5. Licences by sector (donut chart) ──────────────────────────────
const getLicencesBySector = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { data, error } = yield supabase_1.supabase.from("Licence").select("type");
    if (error)
        throw new Error(error.message);
    const grouped = {};
    for (const item of data !== null && data !== void 0 ? data : []) {
        grouped[item.type] = ((_a = grouped[item.type]) !== null && _a !== void 0 ? _a : 0) + 1;
    }
    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
    return Object.entries(grouped)
        .map(([sector, count]) => ({
        sector,
        count,
        percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    }))
        .sort((a, b) => b.count - a.count);
});
exports.getLicencesBySector = getLicencesBySector;
// ── 6. Monthly licence applications (bar chart) ───────────────────────
const getMonthlyTrends = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { data, error } = yield supabase_1.supabase
        .from("Licence")
        .select("createdAt")
        .order("createdAt", { ascending: true });
    if (error)
        throw new Error(error.message);
    const grouped = {};
    for (const item of data !== null && data !== void 0 ? data : []) {
        const month = new Date(item.createdAt).toLocaleString("default", {
            month: "short",
            year: "numeric",
        });
        grouped[month] = ((_a = grouped[month]) !== null && _a !== void 0 ? _a : 0) + 1;
    }
    return Object.entries(grouped).map(([month, count]) => ({ month, count }));
});
exports.getMonthlyTrends = getMonthlyTrends;
// ── 7. Complaint resolution rate (progress bars) ──────────────────────
const getComplaintResolutionRate = () => __awaiter(void 0, void 0, void 0, function* () {
    const [{ count: total }, { count: resolved }, { count: escalated }, { count: resolvedRecent },] = yield Promise.all([
        supabase_1.supabase.from("Complaint").select("*", { count: "exact", head: true }),
        supabase_1.supabase.from("Complaint").select("*", { count: "exact", head: true }).eq("status", "resolved"),
        supabase_1.supabase.from("Complaint").select("*", { count: "exact", head: true }).eq("status", "escalated"),
        supabase_1.supabase
            .from("Complaint")
            .select("*", { count: "exact", head: true })
            .eq("status", "resolved")
            .gte("createdAt", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);
    const totalCount = total !== null && total !== void 0 ? total : 0;
    const resolvedCount = resolved !== null && resolved !== void 0 ? resolved : 0;
    const escalatedCount = escalated !== null && escalated !== void 0 ? escalated : 0;
    const resolvedRecentCount = resolvedRecent !== null && resolvedRecent !== void 0 ? resolvedRecent : 0;
    const resolvedWithin30Days = totalCount > 0
        ? Number(((resolvedRecentCount / totalCount) * 100).toFixed(1))
        : 0;
    const escalatedCasesClosed = escalatedCount > 0
        ? Number(((resolvedCount / escalatedCount) * 100).toFixed(1))
        : 0;
    const overallResolutionRate = totalCount > 0
        ? Number(((resolvedCount / totalCount) * 100).toFixed(1))
        : 0;
    return {
        resolvedWithin30Days: {
            value: resolvedWithin30Days,
            percentage: resolvedWithin30Days + "%",
        },
        escalatedCasesClosed: {
            value: escalatedCasesClosed,
            percentage: escalatedCasesClosed + "%",
        },
        overallResolutionRate: {
            value: overallResolutionRate,
            percentage: overallResolutionRate + "%",
        },
        totals: {
            total: totalCount,
            resolved: resolvedCount,
            escalated: escalatedCount,
        },
    };
});
exports.getComplaintResolutionRate = getComplaintResolutionRate;
// ── 8. Top providers with most complaints ─────────────────────────────
const getTopProviders = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { data, error } = yield supabase_1.supabase.from("Complaint").select("provider");
    if (error)
        throw new Error(error.message);
    const grouped = {};
    for (const item of data !== null && data !== void 0 ? data : []) {
        grouped[item.provider] = ((_a = grouped[item.provider]) !== null && _a !== void 0 ? _a : 0) + 1;
    }
    return Object.entries(grouped)
        .map(([provider, count]) => ({ provider, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
});
exports.getTopProviders = getTopProviders;
// ── 9. Daily complaints last 7 days ───────────────────────────────────
const getDailyComplaintsLast7Days = () => __awaiter(void 0, void 0, void 0, function* () {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data, error } = yield supabase_1.supabase
        .from("Complaint")
        .select("createdAt")
        .gte("createdAt", sevenDaysAgo.toISOString());
    if (error)
        throw new Error(error.message);
    // Build all 7 days with 0 as default
    const days = {};
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
        days[key] = 0;
    }
    // Fill in real counts
    for (const item of data !== null && data !== void 0 ? data : []) {
        const key = new Date(item.createdAt).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
        if (days[key] !== undefined) {
            days[key]++;
        }
    }
    return Object.entries(days).map(([day, count]) => ({ day, count }));
});
exports.getDailyComplaintsLast7Days = getDailyComplaintsLast7Days;
// ── 10. Complaint resolution time ─────────────────────────────────────
const getResolutionTime = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from("Complaint")
        .select("createdAt, status")
        .eq("status", "resolved");
    if (error)
        throw new Error(error.message);
    if (!data || data.length === 0) {
        return {
            averageDays: 0,
            totalResolved: 0,
            message: "No resolved complaints yet",
        };
    }
    const now = new Date();
    const totalDays = data.reduce((sum, item) => {
        const created = new Date(item.createdAt);
        const days = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
    }, 0);
    const averageDays = Number((totalDays / data.length).toFixed(1));
    return {
        averageDays,
        totalResolved: data.length,
        message: `Average resolution time: ${averageDays} days`,
    };
});
exports.getResolutionTime = getResolutionTime;
// ── 11. Licence approval rate ─────────────────────────────────────────
const getLicenceApprovalRate = () => __awaiter(void 0, void 0, void 0, function* () {
    const [{ count: total }, { count: approved }, { count: pending }, { count: rejected },] = yield Promise.all([
        supabase_1.supabase.from("Licence").select("*", { count: "exact", head: true }),
        supabase_1.supabase.from("Licence").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase_1.supabase.from("Licence").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase_1.supabase.from("Licence").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    ]);
    const totalCount = total !== null && total !== void 0 ? total : 0;
    const approvedCount = approved !== null && approved !== void 0 ? approved : 0;
    return {
        total: totalCount,
        approved: approvedCount,
        pending: pending !== null && pending !== void 0 ? pending : 0,
        rejected: rejected !== null && rejected !== void 0 ? rejected : 0,
        approvalRate: totalCount > 0
            ? Number(((approvedCount / totalCount) * 100).toFixed(1))
            : 0,
    };
});
exports.getLicenceApprovalRate = getLicenceApprovalRate;
// ── 12. User activity summary ─────────────────────────────────────────
const getUserActivitySummary = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const [{ data: complaintUsers }, { data: licenceUsers }] = yield Promise.all([
        supabase_1.supabase.from("Complaint").select("userId"),
        supabase_1.supabase.from("Licence").select("userId"),
    ]);
    const activity = {};
    for (const item of complaintUsers !== null && complaintUsers !== void 0 ? complaintUsers : []) {
        activity[item.userId] = ((_a = activity[item.userId]) !== null && _a !== void 0 ? _a : 0) + 1;
    }
    for (const item of licenceUsers !== null && licenceUsers !== void 0 ? licenceUsers : []) {
        activity[item.userId] = ((_b = activity[item.userId]) !== null && _b !== void 0 ? _b : 0) + 1;
    }
    return Object.entries(activity)
        .map(([userId, totalActions]) => ({ userId, totalActions }))
        .sort((a, b) => b.totalActions - a.totalActions)
        .slice(0, 10);
});
exports.getUserActivitySummary = getUserActivitySummary;
// ── 13. Expiring licences ─────────────────────────────────────────────
const getExpiringLicences = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from("Licence")
        .select("*")
        .eq("status", "approved");
    if (error)
        throw new Error(error.message);
    const now = new Date();
    const withExpiry = (data !== null && data !== void 0 ? data : []).map((licence) => {
        const expiryDate = new Date(licence.createdAt);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return Object.assign(Object.assign({}, licence), { expiryDate, daysUntilExpiry });
    });
    return {
        expiredAlready: withExpiry.filter((l) => l.daysUntilExpiry <= 0),
        expiringIn30Days: withExpiry.filter((l) => l.daysUntilExpiry > 0 && l.daysUntilExpiry <= 30),
        expiringIn60Days: withExpiry.filter((l) => l.daysUntilExpiry > 30 && l.daysUntilExpiry <= 60),
        expiringIn90Days: withExpiry.filter((l) => l.daysUntilExpiry > 60 && l.daysUntilExpiry <= 90),
    };
});
exports.getExpiringLicences = getExpiringLicences;
// ── 14. Search & filter complaints ────────────────────────────────────
const searchComplaints = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let query = supabase_1.supabase.from("Complaint").select("*");
    if (filters.provider) {
        query = query.ilike("provider", `%${filters.provider}%`);
    }
    if (filters.category) {
        query = query.ilike("category", `%${filters.category}%`);
    }
    if (filters.status) {
        query = query.eq("status", filters.status);
    }
    const { data, error } = yield query.order("createdAt", { ascending: false });
    if (error)
        throw new Error(error.message);
    return {
        total: (_a = data === null || data === void 0 ? void 0 : data.length) !== null && _a !== void 0 ? _a : 0,
        results: data !== null && data !== void 0 ? data : [],
    };
});
exports.searchComplaints = searchComplaints;
// ── 15. Recent activity feed ──────────────────────────────────────────
const getRecentActivity = () => __awaiter(void 0, void 0, void 0, function* () {
    const [{ data: complaints }, { data: licences }, { data: notifications },] = yield Promise.all([
        supabase_1.supabase
            .from("Complaint")
            .select("id, refNumber, status, category, provider, createdAt")
            .order("createdAt", { ascending: false })
            .limit(5),
        supabase_1.supabase
            .from("Licence")
            .select("id, type, companyName, status, createdAt")
            .order("createdAt", { ascending: false })
            .limit(5),
        supabase_1.supabase
            .from("Notification")
            .select("id, message, read, createdAt")
            .order("createdAt", { ascending: false })
            .limit(5),
    ]);
    return [
        ...(complaints !== null && complaints !== void 0 ? complaints : []).map((c) => ({
            type: "complaint",
            description: `Complaint ${c.refNumber} — ${c.category} against ${c.provider}`,
            status: c.status,
            createdAt: c.createdAt,
        })),
        ...(licences !== null && licences !== void 0 ? licences : []).map((l) => ({
            type: "licence",
            description: `${l.companyName} applied for ${l.type} licence`,
            status: l.status,
            createdAt: l.createdAt,
        })),
        ...(notifications !== null && notifications !== void 0 ? notifications : []).map((n) => ({
            type: "notification",
            description: n.message,
            status: n.read ? "read" : "unread",
            createdAt: n.createdAt,
        })),
    ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
});
exports.getRecentActivity = getRecentActivity;
