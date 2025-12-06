"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
const product_validator_1 = require("../utils/validators/product.validator");
const auth_validator_1 = require("../utils/validators/auth.validator");
const router = express_1.default.Router();
router.get('/', (0, product_validator_1.listProductsRules)(), auth_validator_1.validate, product_controller_1.default.getAllProducts);
router.get('/:productId', product_controller_1.default.getOneProduct);
exports.default = router;
