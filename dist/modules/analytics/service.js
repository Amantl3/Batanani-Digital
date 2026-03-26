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
exports.getMarketShareData = exports.getDashboardSummary = void 0;
const supabase_1 = require("../../config/supabase");
const getDashboardSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    // We use { count: 'exact', head: true } to get the number of rows 
    // without downloading all the actual data (much faster).
    const [licences, complaints, apps, users] = yield Promise.all([
        supabase_1.supabase.from('Licence').select('*', { count: 'exact', head: true }),
        supabase_1.supabase.from('Complaint').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase_1.supabase.from('Licence').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase_1.supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]);
    return {
        totalLicences: licences.count || 0,
        activeComplaints: complaints.count || 0,
        pendingApps: apps.count || 0,
        portalUsers: users.count || 0,
        // Add mock deltas for the UI "trends"
        licenceDelta: 12,
        complaintDelta: -3,
        userDelta: 8
    };
});
exports.getDashboardSummary = getDashboardSummary;
const getMarketShareData = () => __awaiter(void 0, void 0, void 0, function* () {
    // This groups your licences by type for the Pie Chart
    const { data, error } = yield supabase_1.supabase.from('Licence').select('type');
    if (error)
        return [];
    const groups = data.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
    }, {});
    return Object.keys(groups).map(key => ({
        name: key,
        value: groups[key]
    }));
});
exports.getMarketShareData = getMarketShareData;
