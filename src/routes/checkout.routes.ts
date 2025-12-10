import express from 'express';
import checkoutController from '../controllers/checkout.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../utils/validators/auth.validator';
import { previewCouponRules, checkoutRules } from '../utils/validators/checkout.validator';

const router = express.Router();

// Rota pública para listar métodos de pagamento
router.get('/payment-methods', checkoutController.getPaymentMethods);

// A partir daqui, todas as rotas exigem autenticação
router.use(authMiddleware);

router.post('/checkout/preview', previewCouponRules(), validate, checkoutController.previewCoupon);
router.post('/checkout', checkoutRules(), validate, checkoutController.createOrder);

export default router;
