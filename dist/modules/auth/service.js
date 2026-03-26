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
exports.loginUser = exports.registerUser = void 0;
const supabase_1 = require("../../config/supabase");
const registerUser = (email, password, fullName, omangNumber, preferredLanguage) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                omang_number: omangNumber,
                preferred_language: preferredLanguage,
            }
        }
    });
    if (error)
        throw new Error(error.message);
    return data;
});
exports.registerUser = registerUser;
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase.auth.signInWithPassword({ email, password });
    if (error)
        throw new Error(error.message);
    return data;
});
exports.loginUser = loginUser;
