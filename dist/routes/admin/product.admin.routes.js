"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const product_admin_controller_1 = __importDefault(require("../../controllers/admin/product.admin.controller"));
const upload_middleware_1 = __importDefault(require("../../middlewares/upload.middleware"));
const product_validator_1 = require("../../utils/validators/product.validator");
const router = express_1.default.Router();
// Aplica segurança de admin para TODAS as rotas neste arquivo
router.use(auth_middleware_1.authMiddleware, (0, auth_middleware_1.restrictTo)('admin'));
router
    .route('/')
    .get(product_admin_controller_1.default.getAllProducts)
    .post(upload_middleware_1.default.array('images', 5), (0, product_validator_1.createProductRules)(), product_validator_1.validate, product_admin_controller_1.default.createNewProduct);
router
    .route('/:productId')
    .get(product_admin_controller_1.default.getOneProduct)
    .patch((0, product_validator_1.updateProductRules)(), product_validator_1.validate, product_admin_controller_1.default.updateExistingProduct)
    .delete((0, product_validator_1.deleteProductRules)(), product_validator_1.validate, product_admin_controller_1.default.deleteExistingProduct);
// Rotas para manipulação de imagens
router
    .post('/:productId/images', upload_middleware_1.default.array('images'), (0, product_validator_1.validateAddImages)(), product_validator_1.validate, product_admin_controller_1.default.addProductImages)
    .patch('/:productId/images', (0, product_validator_1.validateUpdateImages)(), product_validator_1.validate, product_admin_controller_1.default.updateProductImages)
    .delete('/:productId/images', (0, product_validator_1.validateDeleteImages)(), product_validator_1.validate, product_admin_controller_1.default.deleteProductImages);
exports.default = router;
