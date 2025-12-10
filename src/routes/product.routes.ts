import express from 'express';
import productController from '../controllers/product.controller';
import { listProductsRules } from '../utils/validators/product.validator';
import { validate } from '../utils/validators/auth.validator';
const router = express.Router();

router.get('/', listProductsRules(), validate, productController.getAllProducts);
router.get('/:productId', productController.getOneProduct);

export default router;
