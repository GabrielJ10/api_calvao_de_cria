import express, { Router } from 'express';
import productController, { ProductController } from '../controllers/product.controller';
import { listProductsRules } from '../utils/validators/product.validator';
import { validate } from '../utils/validators/auth.validator';

/**
 * Factory function to create product routes with injected controller.
 * Used for Top-Down testing where we can inject mocked controllers.
 */
export const createProductRoutes = (controller: ProductController): Router => {
  const router = express.Router();

  router.get('/', listProductsRules(), validate, controller.getAllProducts);
  router.get('/:productId', controller.getOneProduct);

  return router;
};

// Default export for backward compatibility
export default createProductRoutes(productController);
