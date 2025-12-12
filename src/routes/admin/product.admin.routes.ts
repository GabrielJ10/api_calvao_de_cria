import express, { Router } from 'express';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import productAdminController, {
  ProductAdminController,
} from '../../controllers/admin/product.admin.controller';
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

/**
 * Factory function to create product admin routes with injected controller.
 * Used for Top-Down testing where we can inject mocked controllers.
 */
export const createProductAdminRoutes = (controller: ProductAdminController): Router => {
  const router = express.Router();

  // Aplica segurança de admin para TODAS as rotas neste arquivo
  router.use(authMiddleware, restrictTo('admin'));

  router
    .route('/')
    .get(controller.getAllProducts)
    .post(upload.array('images', 5), createProductRules(), validate, controller.createNewProduct);

  router
    .route('/:productId')
    .get(controller.getOneProduct)
    .patch(updateProductRules(), validate, controller.updateExistingProduct)
    .delete(deleteProductRules(), validate, controller.deleteExistingProduct);

  // Rotas para manipulação de imagens
  router
    .post(
      '/:productId/images',
      upload.array('images'),
      validateAddImages(),
      validate,
      controller.addProductImages
    )
    .patch('/:productId/images', validateUpdateImages(), validate, controller.updateProductImages)
    .delete('/:productId/images', validateDeleteImages(), validate, controller.deleteProductImages);

  return router;
};

// Default export for backward compatibility
export default createProductAdminRoutes(productAdminController);
