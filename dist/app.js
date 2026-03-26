"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./modules/licences/routes"));
const routes_2 = __importDefault(require("./modules/complaints/routes"));
const routes_3 = __importDefault(require("./modules/analytics/routes"));
const app = (0, express_1.default)();
// 1. Fix CORS once and for all
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express_1.default.json());
// 2. Map existing modules to the paths the frontend is calling
app.use('/api/licences', routes_1.default);
app.use('/api/complaints', routes_2.default);
// 3. Admin Aliases (Frontend calls these specifically)
app.use('/api/admin/licences', routes_1.default);
app.use('/api/admin/complaints', routes_2.default);
app.use('/api/analytics', routes_3.default);
// 3. Dummy Notifications route to stop the 404 spam in your console
app.get('/api/notifications', (req, res) => {
    res.json({ success: true, data: [] });
});
app.get('/', (req, res) => res.send('BOCRA API LIVE'));
exports.default = app;
