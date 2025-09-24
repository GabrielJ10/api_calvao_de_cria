const express = require('express');
const checkoutController = require('../controllers/checkout.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../utils/validators/auth.validator');
const { previewCouponRules, checkoutRules } = require('../utils/validators/checkout.validator');

const router = express.Router();

// Rota pública para listar métodos de pagamento
router.get('/payment-methods', checkoutController.getPaymentMethods);

// A partir daqui, todas as rotas exigem autenticação
router.use(authMiddleware);

router.post('/checkout/preview', previewCouponRules(), validate, checkoutController.previewCoupon);
router.post('/checkout', checkoutRules(), validate, checkoutController.createOrder);

module.exports = router;