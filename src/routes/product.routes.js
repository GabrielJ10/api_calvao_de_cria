const express = require('express');
const productController = require('../controllers/product.controller');
const { listProductsRules, validate } = require('../utils/validators/product.validator');
const router = express.Router();

router.get('/', listProductsRules(), validate, productController.getAllProducts);
router.get('/:productId', productController.getOneProduct);

module.exports = router;
