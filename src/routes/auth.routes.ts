import express from 'express';
import authController from '../controllers/auth.controller';
import {
  registerRules,
  loginRules,
  validate,
  forgotPasswordRules,
  resetPasswordRules,
  refreshTokenRules,
} from '../utils/validators/auth.validator';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', registerRules(), validate, authController.register);
router.post('/login', loginRules(), validate, authController.login);
router.post('/refresh', refreshTokenRules(), validate, authController.refreshToken); // Added validate, missing in JS but good practice
router.post('/forgot-password', forgotPasswordRules(), validate, authController.forgotPassword);
router.post(
  '/reset-password/:resetToken',
  resetPasswordRules(),
  validate,
  authController.resetPassword
);

router.post('/logout', authMiddleware, authController.logout);

export default router;
