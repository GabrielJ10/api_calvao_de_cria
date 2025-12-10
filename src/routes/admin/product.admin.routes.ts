import express from 'express';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import productAdminController from '../../controllers/admin/product.admin.controller';
import upload from '../../middlewares/upload.middleware';
import {
  createProductRules,
  updateProductRules,
  deleteProductRules,
  validateUpdateImages,
  validateAddImages,
  validateDeleteImages,
  validate,
} from '../../utils/validators/product.validator';

const router = express.Router();

// Aplica segurança de admin para TODAS as rotas neste arquivo
router.use(authMiddleware, restrictTo('admin'));

router
  .route('/')
  .get(productAdminController.getAllProducts)
  .post(
    upload.array('images', 5),
    createProductRules(),
    validate,
    productAdminController.createNewProduct
  );

router
  .route('/:productId')
  .get(productAdminController.getOneProduct)
  .patch(updateProductRules(), validate, productAdminController.updateExistingProduct)
  .delete(deleteProductRules(), validate, productAdminController.deleteExistingProduct);

// Rotas para manipulação de imagens
router
  .post(
    '/:productId/images',
    upload.array('images'),
    validateAddImages(),
    validate,
    productAdminController.addProductImages
  )
  .patch(
    '/:productId/images',
    validateUpdateImages(),
    validate,
    productAdminController.updateProductImages
  )
  .delete(
    '/:productId/images',
    validateDeleteImages(),
    validate,
    productAdminController.deleteProductImages
  );

export default router;
