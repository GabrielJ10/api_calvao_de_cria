import mongoose from 'mongoose';
import Cart from '../../models/cart.model';

/**
 * Cart Factory
 * Provides methods to create cart instances for testing
 */

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
