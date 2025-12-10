import express, { Request, Response } from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import checkoutRoutes from './routes/checkout.routes';

// Admin Routes
import productAdminRoutes from './routes/admin/product.admin.routes';
import orderAdminRoutes from './routes/admin/order.admin.routes';
import userAdminRoutes from './routes/admin/user.admin.routes';
import couponAdminRoutes from './routes/admin/coupon.admin.routes';
import paymentMethodAdminRoutes from './routes/admin/paymentMethod.admin.routes';

const app = express();

app.use(express.json());
app.use(cors());

// Roteador principal
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1', checkoutRoutes);

// Rotas de admin
app.use('/api/v1/admin/products', productAdminRoutes);
app.use('/api/v1/admin/orders', orderAdminRoutes);
app.use('/api/v1/admin/users', userAdminRoutes);
app.use('/api/v1/admin/coupons', couponAdminRoutes);
app.use('/api/v1/admin/payment-methods', paymentMethodAdminRoutes);

// Rota de teste
app.get('/', (req: Request, res: Response) => {
  res.send('API Calvão de Cria está no ar!');
});

// Middleware de tratamento de erros GLOBAL
app.use(errorHandler);

export default app;
