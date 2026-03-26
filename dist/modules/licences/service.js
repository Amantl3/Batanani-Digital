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
exports.getExpiringSoonLicences = exports.getPendingLicences = exports.getRecentLicences = exports.getLicenceStats = exports.deleteLicence = exports.updateLicenceStatus = exports.createLicence = exports.getLicence = exports.getAllLicences = void 0;
/**
 * src/modules/licences/service.ts
 */
const supabase_1 = require("../../config/supabase");
const getAllLicences = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const { search, type, status, userId, page = 1, limit = 15 } = filters;
    let query = supabase_1.supabase.from('Licence').select('*', { count: 'exact' });
    // FIX: Fixed the search query formatting for Supabase
    if (search) {
        query = query.or(`companyName.ilike.%${search}%,id.ilike.%${search}%`);
    }
    if (type)
        query = query.eq('type', type);
    if (status)
        query = query.eq('status', status);
    if (userId)
        query = query.eq('userId', userId);
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order('createdAt', { ascending: false });
    const { data, error, count } = yield query;
    if (error)
        throw new Error(error.message);
    return {
        results: data !== null && data !== void 0 ? data : [],
        total: count !== null && count !== void 0 ? count : 0,
        page,
        limit,
        totalPages: Math.ceil((count !== null && count !== void 0 ? count : 0) / limit),
    };
});
exports.getAllLicences = getAllLicences;
const getLicence = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('Licence')
        .select('*')
        .eq('id', id)
        .single();
    if (error)
        throw new Error(error.message);
    return data;
});
exports.getLicence = getLicence;
const createLicence = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('Licence')
        .insert({
        type: payload.type,
        companyName: payload.companyName,
        userId: payload.userId,
        region: payload.region || 'Gaborone', // FIX: Added default region for map
        status: 'pending',
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
});
exports.createLicence = createLicence;
const updateLicenceStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('Licence')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
});
exports.updateLicenceStatus = updateLicenceStatus;
const deleteLicence = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = yield supabase_1.supabase.from('Licence').delete().eq('id', id);
    if (error)
        throw new Error(error.message);
    return { deleted: true };
});
exports.deleteLicence = deleteLicence;
const getLicenceStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { data, error } = yield supabase_1.supabase.from('Licence').select('status');
    if (error)
        throw new Error(error.message);
    const stats = (data !== null && data !== void 0 ? data : []).reduce((acc, row) => {
        var _a;
        acc[row.status] = ((_a = acc[row.status]) !== null && _a !== void 0 ? _a : 0) + 1;
        return acc;
    }, {});
    return {
        total: (_a = data === null || data === void 0 ? void 0 : data.length) !== null && _a !== void 0 ? _a : 0,
        active: (_b = stats['active']) !== null && _b !== void 0 ? _b : 0,
        pending: (_c = stats['pending']) !== null && _c !== void 0 ? _c : 0,
        suspended: (_d = stats['suspended']) !== null && _d !== void 0 ? _d : 0,
        expired: (_e = stats['expired']) !== null && _e !== void 0 ? _e : 0,
    };
});
exports.getLicenceStats = getLicenceStats;
const getRecentLicences = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 5) {
    const { data, error } = yield supabase_1.supabase
        .from('Licence')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(limit);
    if (error)
        throw new Error(error.message);
    return data !== null && data !== void 0 ? data : [];
});
exports.getRecentLicences = getRecentLicences;
const getPendingLicences = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('Licence')
        .select('*')
        .eq('status', 'pending')
        .order('createdAt', { ascending: false });
    if (error)
        throw new Error(error.message);
    return data !== null && data !== void 0 ? data : [];
});
exports.getPendingLicences = getPendingLicences;
const getExpiringSoonLicences = () => __awaiter(void 0, void 0, void 0, function* () {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const { data, error } = yield supabase_1.supabase
        .from('Licence')
        .select('*')
        .eq('status', 'active')
        .lte('expiresAt', thirtyDays.toISOString())
        .order('expiresAt', { ascending: true });
    if (error)
        throw new Error(error.message);
    return data !== null && data !== void 0 ? data : [];
});
exports.getExpiringSoonLicences = getExpiringSoonLicences;
