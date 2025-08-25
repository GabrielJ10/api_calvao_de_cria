const express = require('express');
const { authMiddleware, restrictTo } = require('../../middlewares/auth.middleware');
const productAdminController = require('../../controllers/admin/product.admin.controller');
const {
  createProductRules,
  updateProductRules,
  productIdRule,
  validate,
} = require('../../utils/validators/product.validator');

const router = express.Router();

// Aplica segurança de admin para TODAS as rotas neste arquivo
router.use(authMiddleware, restrictTo('admin'));

router
  .route('/')
  .get(productAdminController.getAllProducts)
  .post(createProductRules(), validate, productAdminController.createNewProduct);

router
  .route('/:productId')
  .get( productAdminController.getOneProduct)
  .patch(updateProductRules(), validate, productAdminController.updateExistingProduct)
  .delete(productIdRule(), validate, productAdminController.deleteExistingProduct);

module.exports = router;
