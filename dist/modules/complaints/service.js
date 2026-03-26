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
exports.getComplaintStats = exports.updateComplaintStatus = exports.createComplaint = exports.getAllComplaints = void 0;
/**
 * src/modules/complaints/service.ts
 */
const supabase_1 = require("../../config/supabase");
const getAllComplaints = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const { status, category, provider, userId, page = 1, limit = 15, search } = filters;
    let query = supabase_1.supabase.from('Complaint').select('*', { count: 'exact' });
    if (status)
        query = query.eq('status', status);
    if (category)
        query = query.eq('category', category);
    if (provider)
        query = query.eq('provider', provider);
    if (userId)
        query = query.eq('userId', userId);
    if (search)
        query = query.ilike('description', `%${search}%`);
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order('createdAt', { ascending: false });
    const { data, error, count } = yield query;
    if (error)
        throw new Error(error.message);
    return {
        results: data !== null && data !== void 0 ? data : [],
        total: count !== null && count !== void 0 ? count : 0,
    };
});
exports.getAllComplaints = getAllComplaints;
const createComplaint = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('Complaint')
        .insert([Object.assign(Object.assign({}, payload), { status: 'pending' })])
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
});
exports.createComplaint = createComplaint;
const updateComplaintStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('Complaint')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
});
exports.updateComplaintStatus = updateComplaintStatus;
const getComplaintStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { data, error } = yield supabase_1.supabase.from('Complaint').select('status, category');
    if (error)
        throw new Error(error.message);
    const stats = (data !== null && data !== void 0 ? data : []).reduce((acc, curr) => {
        var _a;
        acc[curr.status] = ((_a = acc[curr.status]) !== null && _a !== void 0 ? _a : 0) + 1;
        return acc;
    }, {});
    return {
        total: (_a = data === null || data === void 0 ? void 0 : data.length) !== null && _a !== void 0 ? _a : 0,
        pending: (_b = stats['pending']) !== null && _b !== void 0 ? _b : 0,
        resolved: (_c = stats['resolved']) !== null && _c !== void 0 ? _c : 0,
    };
});
exports.getComplaintStats = getComplaintStats;
