import express from 'express';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import userAdminController from '../../controllers/admin/user.admin.controller';

const router = express.Router();

// Aplica segurança de admin para TODAS as rotas neste arquivo
router.use(authMiddleware, restrictTo('admin'));

router.route('/').get(userAdminController.listCustomers);

router.route('/:userId').get(userAdminController.getCustomerDetails);

router.route('/:userId/force-password-reset').post(userAdminController.forcePasswordReset);

export default router;
