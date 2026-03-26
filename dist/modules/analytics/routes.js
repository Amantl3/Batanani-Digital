"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const router = (0, express_1.Router)();
// This will be accessible at /api/analytics/dashboard
router.get('/dashboard', controller_1.getDashboardStats);
exports.default = router;
