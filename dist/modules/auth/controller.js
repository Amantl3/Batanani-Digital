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
exports.login = exports.register = void 0;
const service_1 = require("./service");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { email, password, fullName, omangNumber, preferredLanguage } = req.body;
        const data = yield (0, service_1.registerUser)(email, password, fullName, omangNumber, preferredLanguage);
        res.status(201).json({
            user: {
                id: (_a = data.user) === null || _a === void 0 ? void 0 : _a.id,
                email: (_b = data.user) === null || _b === void 0 ? void 0 : _b.email,
                fullName: (_f = (_e = (_d = (_c = data.user) === null || _c === void 0 ? void 0 : _c.user_metadata) === null || _d === void 0 ? void 0 : _d.full_name) !== null && _e !== void 0 ? _e : fullName) !== null && _f !== void 0 ? _f : "",
                role: "public",
                omangVerified: false,
                preferredLanguage: preferredLanguage !== null && preferredLanguage !== void 0 ? preferredLanguage : "en",
                createdAt: (_g = data.user) === null || _g === void 0 ? void 0 : _g.created_at,
            }
        });
    }
    catch (error) {
        res.status(400).json({ detail: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        const { email, password } = req.body;
        const data = yield (0, service_1.loginUser)(email, password);
        res.status(200).json({
            user: {
                id: (_a = data.user) === null || _a === void 0 ? void 0 : _a.id,
                email: (_b = data.user) === null || _b === void 0 ? void 0 : _b.email,
                fullName: (_e = (_d = (_c = data.user) === null || _c === void 0 ? void 0 : _c.user_metadata) === null || _d === void 0 ? void 0 : _d.full_name) !== null && _e !== void 0 ? _e : email,
                role: "public",
                omangVerified: false,
                preferredLanguage: (_h = (_g = (_f = data.user) === null || _f === void 0 ? void 0 : _f.user_metadata) === null || _g === void 0 ? void 0 : _g.preferred_language) !== null && _h !== void 0 ? _h : "en",
                createdAt: (_j = data.user) === null || _j === void 0 ? void 0 : _j.created_at,
            },
            accessToken: (_k = data.session) === null || _k === void 0 ? void 0 : _k.access_token,
        });
    }
    catch (error) {
        res.status(400).json({ detail: error.message });
    }
});
exports.login = login;
