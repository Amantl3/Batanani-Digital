"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const router = (0, express_1.Router)();
router.get('/', controller_1.getDocuments);
router.get('/seed', controller_1.seed);
router.get('/:id', controller_1.getDocument);
exports.default = router;
