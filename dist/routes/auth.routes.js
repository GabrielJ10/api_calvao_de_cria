"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_validator_1 = require("../utils/validators/auth.validator");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/register', (0, auth_validator_1.registerRules)(), auth_validator_1.validate, auth_controller_1.default.register);
router.post('/login', (0, auth_validator_1.loginRules)(), auth_validator_1.validate, auth_controller_1.default.login);
router.post('/refresh', (0, auth_validator_1.refreshTokenRules)(), auth_validator_1.validate, auth_controller_1.default.refreshToken); // Added validate, missing in JS but good practice
router.post('/forgot-password', (0, auth_validator_1.forgotPasswordRules)(), auth_validator_1.validate, auth_controller_1.default.forgotPassword);
router.post('/reset-password/:resetToken', (0, auth_validator_1.resetPasswordRules)(), auth_validator_1.validate, auth_controller_1.default.resetPassword);
router.post('/logout', auth_middleware_1.authMiddleware, auth_controller_1.default.logout);
exports.default = router;
