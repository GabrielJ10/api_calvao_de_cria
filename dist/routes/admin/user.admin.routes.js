"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const user_admin_controller_1 = __importDefault(require("../../controllers/admin/user.admin.controller"));
const router = express_1.default.Router();
// Aplica segurança de admin para TODAS as rotas neste arquivo
router.use(auth_middleware_1.authMiddleware, (0, auth_middleware_1.restrictTo)('admin'));
router.route('/').get(user_admin_controller_1.default.listCustomers);
router.route('/:userId').get(user_admin_controller_1.default.getCustomerDetails);
router.route('/:userId/force-password-reset').post(user_admin_controller_1.default.forcePasswordReset);
exports.default = router;
