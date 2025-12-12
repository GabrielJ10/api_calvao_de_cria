import express, { Router } from 'express';
import authController, { AuthController } from '../controllers/auth.controller';
import {
  registerRules,
  loginRules,
  validate,
  forgotPasswordRules,
  resetPasswordRules,
  refreshTokenRules,
} from '../utils/validators/auth.validator';
import { authMiddleware } from '../middlewares/auth.middleware';

/**
 * Factory function to create auth routes with injected controller.
 * Used for Top-Down testing where we can inject mocked controllers.
 */
export const createAuthRoutes = (controller: AuthController): Router => {
  const router = express.Router();

  router.post('/register', registerRules(), validate, controller.register);
  router.post('/login', loginRules(), validate, controller.login);
  router.post('/refresh', refreshTokenRules(), validate, controller.refreshToken);
  router.post('/forgot-password', forgotPasswordRules(), validate, controller.forgotPassword);
  router.post(
    '/reset-password/:resetToken',
    resetPasswordRules(),
    validate,
    controller.resetPassword
  );

  router.post('/logout', authMiddleware, controller.logout);

  return router;
};

// Default export for backward compatibility
export default createAuthRoutes(authController);
