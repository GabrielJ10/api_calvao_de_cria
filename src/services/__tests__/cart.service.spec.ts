import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies BEFORE import to prevent side-effects during module load
vi.mock('../repositories/cart.repository', () => ({
  default: {},
  CartRepository: class {},
}));
vi.mock('../repositories/product.repository', () => ({
  default: {},
  ProductRepository: class {},
}));
vi.mock('../repositories/coupon.repository', () => ({
  default: {},
  CouponRepository: class {},
}));

import { CartService } from '../cart.service';
import AppError from '../../utils/AppError';

// Mocks
const mockCartRepo = {
  findByIdentifier: vi.fn(),
  create: vi.fn(),
  findByGuestCartId: vi.fn(),
  deleteByGuestCartId: vi.fn(),
};

const mockProductRepo = {
  findByIdPublic: vi.fn(),
};

const mockCouponRepo = {
  findByCode: vi.fn(),
};

describe('CartService', () => {
  let cartService: CartService;

  beforeEach(() => {
    vi.clearAllMocks();
    cartService = new CartService(
      mockCartRepo as any,
      mockProductRepo as any,
      mockCouponRepo as any
    );
  });

  describe('addItemToCart', () => {
    it('should calculate totals correctly when adding item', async () => {
      const mockProduct = {
        _id: 'prod1',
        name: 'Product 1',
        price: 100,
        promotionalPrice: 90,
        isPromotionActive: true,
        stockQuantity: 10,
        mainImageUrl: 'url',
      };
      mockProductRepo.findByIdPublic.mockResolvedValue(mockProduct);

      const mockCart = {
        items: [],
        save: vi.fn().mockImplementation(function () {
          return this;
        }),
      };
      mockCartRepo.findByIdentifier.mockResolvedValue(mockCart);

      const result = await cartService.addItemToCart(
        { userId: 'user1' },
        { productId: 'prod1', quantity: 2 }
      );

      expect(mockCart.items).toHaveLength(1);
      expect(mockCart.items[0].quantity).toBe(2);
      expect(mockCart.items[0].unitPrice).toBe(90); // Promotional price
      expect(mockCart.items[0].totalItemPrice).toBe(180);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should throw 409 if stock is insufficient', async () => {
      const mockProduct = {
        _id: 'prod1',
        stockQuantity: 1,
      };
      mockProductRepo.findByIdPublic.mockResolvedValue(mockProduct);

      const mockCart = {
        items: [],
        save: vi.fn(),
      };
      mockCartRepo.findByIdentifier.mockResolvedValue(mockCart);

      await expect(
        cartService.addItemToCart({ userId: 'user1' }, { productId: 'prod1', quantity: 2 })
      ).rejects.toThrow(AppError); // Check for specific error message if possible
    });
  });

  describe('mergeCarts', () => {
    it('should merge guest cart items into user cart', async () => {
      const guestCart = {
        items: [{ productId: 'prod1', quantity: 1, unitPrice: 100, totalItemPrice: 100 }],
      };
      mockCartRepo.findByGuestCartId.mockResolvedValue(guestCart);

      const userCart = {
        items: [{ productId: 'prod1', quantity: 1, unitPrice: 100, totalItemPrice: 100 }],
        save: vi.fn().mockImplementation(function () {
          return this;
        }),
      };

      // Mock getOrCreateCart behavior by mocking findByIdentifier for userId
      mockCartRepo.findByIdentifier.mockResolvedValue(userCart);

      const result = await cartService.mergeCarts('user1', 'guest1');

      expect(userCart.items).toHaveLength(1); // Should merge into existing item
      expect(userCart.items[0].quantity).toBe(2);
      expect(userCart.items[0].totalItemPrice).toBe(200);
      expect(mockCartRepo.deleteByGuestCartId).toHaveBeenCalledWith('guest1');
    });
  });
});
