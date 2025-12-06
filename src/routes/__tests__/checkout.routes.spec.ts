import request from 'supertest';
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import app from '../../app';
import jwt from 'jsonwebtoken';
import Product from '../../models/product.model';
import Cart from '../../models/cart.model';
import User from '../../models/user.model';
import Address from '../../models/address.model';
import PaymentMethod from '../../models/paymentMethod.model';
import mongoose from 'mongoose';

// Ensure cloudinary is mocked
vi.mock('../../services/storage/cloudinaryStorage');
// Mock PixService module to return fake qrcode.
vi.mock('../../services/payment/pix.service', () => ({
  default: {
    processPixPayment: vi.fn().mockResolvedValue({
      method: 'pix',
      type: 'PIX',
      qrCodeImage: 'http://fake.qr/code.png',
      copyPasteCode: '00020126360014BR.GOV.BCB.PIX...',
    }),
  },
}));

const TEST_SECRET = 'testsecret';

describe('Checkout Routes Integration', () => {
  let productId: string;
  let userId: string;
  let token: string;
  let addressId: string;

  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = TEST_SECRET;
  });

  beforeEach(async () => {
    // 1. Seed User
    const user = await User.create({
      name: 'Checkout User',
      email: 'checkout@example.com',
      passwordHash: 'hash',
      cpf: '11122233344',
      phone: '999999999',
    });
    userId = user._id.toString();
    token = jwt.sign({ userId, role: 'customer' }, TEST_SECRET, { expiresIn: '1h' });

    // 2. Seed Address
    const address = await Address.create({
      userId: user._id,
      alias: 'Casa',
      recipientName: 'Recipient',
      street: 'Rua Teste',
      number: '123',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'ES',
      cep: '29000-000',
      phone: '27999999999',
    });
    addressId = address._id.toString();

    // 3. Seed Payment Method
    await PaymentMethod.create({
      identifier: 'pix',
      name: 'Pix',
      isEnabled: true,
    });

    // 4. Seed Product
    const product = await Product.create({
      name: 'Checkout Product',
      description: 'Test Description',
      price: 50.0,
      stockQuantity: 100,
      isActive: true,
      mainImageUrl: 'http://img.com/p.png',
    });
    productId = product._id.toString();

    // 5. Seed Cart with Item
    const cart = await Cart.create({
      userId: user._id,
      items: [
        {
          productId: product._id,
          name: product.name,
          quantity: 2,
          price: 50.0,
          unitPrice: 50.0,
          totalItemPrice: 100.0,
          mainImageUrl: 'http://img.com/p.png',
        },
      ],
      subtotal: 100.0,
      total: 100.0,
    });
  });

  describe('POST /api/v1/checkout', () => {
    it('should create an order successfully', async () => {
      const res = await request(app)
        .post('/api/v1/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          addressId,
          paymentMethodIdentifier: 'pix',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.orderNumber).toBeDefined();
      expect(res.body.data.status).toBe('AWAITING_PAYMENT');
      expect(res.body.data.totals.total).toBe(100.0);
    });

    it('should fail if cart is empty', async () => {
      // Clear cart first
      await Cart.updateOne({ userId }, { items: [], subtotal: 0, total: 0 });

      const res = await request(app)
        .post('/api/v1/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          addressId,
          paymentMethodIdentifier: 'pix',
        });

      expect(res.status).toBe(400); // Bad Request
    });
  });
});
