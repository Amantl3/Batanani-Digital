"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Public - No 'protect' here so dashboard loads immediately
router.get('/stats', controller_1.licenceStats);
router.get('/', controller_1.listLicences);
router.get('/:id', controller_1.getLicenceById);
// Protected - Require login
router.post('/', auth_1.protect, controller_1.applyForLicence);
router.patch('/:id/status', auth_1.protect, controller_1.updateStatus);
exports.default = router;
