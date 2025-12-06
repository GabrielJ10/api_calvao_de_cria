import mongoose from 'mongoose';
import User, { IUser } from '../models/user.model';
import Product, { IProduct } from '../models/product.model';
import Address from '../models/address.model';
import Cart from '../models/cart.model';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/**
 * Test Data Factories
 * Centralizes the creation of test data to avoid boilerplate and inconsistent data in tests.
 */

export const UserFactory = {
  create: async (overrides: Partial<IUser> = {}): Promise<IUser> => {
    const defaultUser = {
      name: 'Test User',
      email: `test-${uuidv4()}@example.com`,
      cpf: generateValidCPF(), // Simplified generator or fixed valid CPF
      passwordHash: await bcrypt.hash('password123', 10),
      phone: '11999999999',
      role: 'customer',
      ...overrides,
    };
    return User.create(defaultUser);
  },

  // Creates a plain object without saving to DB (good for unit tests mocking repositories)
  build: (overrides: Partial<IUser> = {}) => {
    return {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test User',
      email: `test-${uuidv4()}@example.com`,
      cpf: '12345678909',
      passwordHash: 'hashed_password',
      phone: '11999999999',
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as unknown as IUser;
  },
};

export const ProductFactory = {
  create: async (overrides: Partial<IProduct> = {}): Promise<IProduct> => {
    const defaultProduct = {
      name: `Product ${uuidv4()}`,
      description: 'A great product description.',
      price: 100.0,
      stockQuantity: 10,
      isActive: true,
      mainImageUrl: 'http://example.com/image.jpg',
      category: new mongoose.Types.ObjectId(), // Mock category ID
      ...overrides,
    };
    return Product.create(defaultProduct);
  },

  build: (overrides: Partial<IProduct> = {}) => {
    return {
      _id: new mongoose.Types.ObjectId(),
      name: `Product ${uuidv4()}`,
      description: 'A great product description.',
      price: 100.0,
      stockQuantity: 10,
      isActive: true,
      mainImageUrl: 'http://example.com/image.jpg',
      category: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: `product-${uuidv4()}`,
      ...overrides,
    } as unknown as IProduct;
  },
};

export const AddressFactory = {
  create: async (userId: mongoose.Types.ObjectId, overrides: any = {}) => {
    const defaultAddress = {
      userId,
      alias: 'Home',
      recipientName: 'Receiver Name',
      street: 'Main Street',
      number: '123',
      neighborhood: 'Downtown',
      city: 'Metropolis',
      state: 'SP',
      cep: '01000-000',
      phone: '11988888888',
      ...overrides,
    };
    return Address.create(defaultAddress);
  },
};

export const CartFactory = {
  create: async (userId: mongoose.Types.ObjectId, overrides: any = {}) => {
    const defaultCart = {
      userId,
      items: [],
      subtotal: 0,
      total: 0,
      ...overrides,
    };
    return Cart.create(defaultCart);
  },
};

// Helper to generate a technically valid-looking CPF (not strictly algorithmic valid if validator doesn't check checksums in tests,
// but sticking to a fixed one or randomizing the digits is usually enough for basic constraints unless strict validation is active).
// For now, using a fixed one or simplistic randomizer to avoid 'unique' constraints if we reuse.
function generateValidCPF(): string {
  // Generate 11 random digits
  let cpf = '';
  for (let i = 0; i < 11; i++) {
    cpf += Math.floor(Math.random() * 10).toString();
  }
  return cpf;
}
