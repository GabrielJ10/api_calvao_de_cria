"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors")); // TS might complain if no types, but we assume they are installed or we'll fix
const db_1 = __importDefault(require("./config/db"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const checkout_routes_1 = __importDefault(require("./routes/checkout.routes"));
// Admin Routes
const product_admin_routes_1 = __importDefault(require("./routes/admin/product.admin.routes"));
const order_admin_routes_1 = __importDefault(require("./routes/admin/order.admin.routes"));
const user_admin_routes_1 = __importDefault(require("./routes/admin/user.admin.routes"));
const coupon_admin_routes_1 = __importDefault(require("./routes/admin/coupon.admin.routes"));
const paymentMethod_admin_routes_1 = __importDefault(require("./routes/admin/paymentMethod.admin.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Conectar ao Banco de Dados
(0, db_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Roteador principal
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/products', product_routes_1.default);
app.use('/api/v1/cart', cart_routes_1.default);
app.use('/api/v1', checkout_routes_1.default);
// Rotas de admin
app.use('/api/v1/admin/products', product_admin_routes_1.default);
app.use('/api/v1/admin/orders', order_admin_routes_1.default);
app.use('/api/v1/admin/users', user_admin_routes_1.default);
app.use('/api/v1/admin/coupons', coupon_admin_routes_1.default);
app.use('/api/v1/admin/payment-methods', paymentMethod_admin_routes_1.default);
// Rota de teste
app.get('/', (req, res) => {
    res.send('API Calvão de Cria está no ar!');
});
// Middleware de tratamento de erros GLOBAL
app.use(errorHandler_1.default);
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
