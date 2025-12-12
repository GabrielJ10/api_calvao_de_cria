import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CheckoutService } from '../../../src/services/checkout.service';
import { OrderStatus } from '../../../src/enums/order.enum';

/**
 * Top-Down Level 2: Business Flow Tests
 *
 * Purpose: Test the business logic with real Service, but mocked Repository.
 * This level tests:
 * - Business rules (coupon calculations, order totals, validations)
 * - Service calling repository with correctly processed data
 * - Error handling for business rule violations
 */
describe('Checkout Flow (Top-Down L2)', () => {
  // Mock repositories
  let mockCartRepo: {
    findByIdentifier: ReturnType<typeof vi.fn>;
  };
  let mockAddressRepo: {
    findAddressByIdAndUserIdDetail: ReturnType<typeof vi.fn>;
  };
  let mockPaymentMethodRepo: {
    findByIdentifier: ReturnType<typeof vi.fn>;
    findAllEnabled: ReturnType<typeof vi.fn>;
  };
  let mockOrderRepo: {
    findLastByDatePrefix: ReturnType<typeof vi.fn>;
    createOrderTransactional: ReturnType<typeof vi.fn>;
  };
  let mockCouponRepo: {
    findByCode: ReturnType<typeof vi.fn>;
  };
  let mockPixService: {
    processPixPayment: ReturnType<typeof vi.fn>;
  };

  let checkoutService: CheckoutService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCartRepo = {
      findByIdentifier: vi.fn(),
    };

    mockAddressRepo = {
      findAddressByIdAndUserIdDetail: vi.fn(),
    };

    mockPaymentMethodRepo = {
      findByIdentifier: vi.fn(),
      findAllEnabled: vi.fn(),
    };

    mockOrderRepo = {
      findLastByDatePrefix: vi.fn(),
      createOrderTransactional: vi.fn(),
    };

    mockCouponRepo = {
      findByCode: vi.fn(),
    };

    mockPixService = {
      processPixPayment: vi.fn(),
    };

    // Create REAL service with mocked repositories
    checkoutService = new CheckoutService(
      mockCartRepo as any,
      mockAddressRepo as any,
      mockPaymentMethodRepo as any,
      mockOrderRepo as any,
      mockCouponRepo as any,
      mockPixService as any
    );
  });

  describe('createOrder', () => {
    const userId = 'user123';
    const mockAddress = {
      recipientName: 'Test User',
      street: 'Rua Principal',
      number: '100',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      cep: '01000-000',
      phone: '11999999999',
    };

    const mockPaymentMethod = {
      identifier: 'pix',
      name: 'PIX',
      isEnabled: true,
    };

    it('should calculate totals correctly without coupon', async () => {
      // Arrange
      const mockCart = {
        items: [
          {
            productId: 'prod1',
            name: 'Product 1',
            quantity: 2,
            price: 50,
            unitPrice: 50,
            totalItemPrice: 100,
            mainImageUrl: 'http://img.com/1.jpg',
          },
        ],
        subtotal: 100,
        itemsDiscount: 0,
        couponDiscount: 0,
        totalDiscount: 0,
        total: 100,
        activeCouponCode: undefined,
        save: vi.fn().mockImplementation(function (this: any) {
          return Promise.resolve(this);
        }),
      };

      mockCartRepo.findByIdentifier.mockResolvedValue(mockCart);
      mockAddressRepo.findAddressByIdAndUserIdDetail.mockResolvedValue(mockAddress);
      mockPaymentMethodRepo.findByIdentifier.mockResolvedValue(mockPaymentMethod);
      mockOrderRepo.findLastByDatePrefix.mockResolvedValue(null);
      mockPixService.processPixPayment.mockResolvedValue({
        method: 'pix',
        qrCodeImageUrl: 'http://qr.com/code.png',
        qrCode: '00020126...',
      });

      // Generate expected order number format
      const today = new Date();
      const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      const expectedOrderNumber = `${datePrefix}-0001`;

      const createdOrder = {
        _id: 'order123',
        orderNumber: expectedOrderNumber,
        status: OrderStatus.AWAITING_PAYMENT,
        createdAt: new Date(),
        shippingAddress: mockAddress,
        items: mockCart.items,
        totals: {
          subtotal: 100,
          itemsDiscount: 0,
          couponDiscount: 0,
          totalDiscount: 0,
          total: 100,
        },
        payment: { method: 'pix' },
      };
      mockOrderRepo.createOrderTransactional.mockResolvedValue(createdOrder);

      // Act
      const result = await checkoutService.createOrder(userId, {
        addressId: 'addr123',
        paymentMethodIdentifier: 'pix',
      });

      // Assert
      expect(result.data.orderNumber).toBe(expectedOrderNumber);
      expect(mockOrderRepo.createOrderTransactional).toHaveBeenCalledWith(
        expect.objectContaining({
          totals: expect.objectContaining({
            total: 100,
            subtotal: 100,
          }),
        })
      );
      expect(mockPixService.processPixPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 100,
          recipientName: 'Test User',
        })
      );
    });

    it('should apply fixed coupon correctly', async () => {
      // Arrange
      const mockCart = {
        items: [
          {
            productId: 'prod1',
            name: 'Product 1',
            quantity: 2,
            unitPrice: 50,
            totalItemPrice: 100,
            mainImageUrl: 'http://img.com/1.jpg',
          },
        ],
        subtotal: 100,
        itemsDiscount: 0,
        couponDiscount: 0,
        totalDiscount: 0,
        total: 100,
        activeCouponCode: undefined,
        couponInfo: undefined,
        save: vi.fn().mockImplementation(function (this: any) {
          // Simula o hook pre('save') que recalcula totais
          if (this.activeCouponCode) {
            this.totalDiscount = this.itemsDiscount + this.couponDiscount;
            this.total = this.subtotal - this.totalDiscount;
          }
          return Promise.resolve(this);
        }),
      };

      const mockCoupon = {
        code: 'DESCONTO10',
        type: 'fixed',
        value: 10,
        minPurchaseValue: 50,
        description: 'R$10 de desconto',
      };

      mockCartRepo.findByIdentifier.mockResolvedValue(mockCart);
      mockAddressRepo.findAddressByIdAndUserIdDetail.mockResolvedValue(mockAddress);
      mockPaymentMethodRepo.findByIdentifier.mockResolvedValue(mockPaymentMethod);
      mockCouponRepo.findByCode.mockResolvedValue(mockCoupon);
      mockOrderRepo.findLastByDatePrefix.mockResolvedValue(null);
      mockPixService.processPixPayment.mockResolvedValue({
        method: 'pix',
        qrCodeImageUrl: 'http://qr.com/code.png',
      });
      mockOrderRepo.createOrderTransactional.mockResolvedValue({
        _id: 'order123',
        orderNumber: '20231206-0001',
        status: OrderStatus.AWAITING_PAYMENT,
        createdAt: new Date(),
        shippingAddress: mockAddress,
        items: [],
        totals: { total: 90 },
        payment: { method: 'pix' },
      });

      // Act
      const result = await checkoutService.createOrder(userId, {
        addressId: 'addr123',
        paymentMethodIdentifier: 'pix',
        couponCode: 'DESCONTO10',
      });

      // Assert - Verify coupon was applied
      expect(mockCouponRepo.findByCode).toHaveBeenCalledWith('DESCONTO10');
      expect(mockCart.activeCouponCode).toBe('DESCONTO10');
      expect(mockCart.couponDiscount).toBe(10);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should throw error when cart is empty', async () => {
      // Arrange
      mockCartRepo.findByIdentifier.mockResolvedValue({ items: [], subtotal: 0 });

      // Act & Assert
      await expect(
        checkoutService.createOrder(userId, {
          addressId: 'addr123',
          paymentMethodIdentifier: 'pix',
        })
      ).rejects.toThrow(/vazio/i);
    });

    it('should throw error when address not found', async () => {
      // Arrange
      const mockCart = {
        items: [{ productId: 'p1', quantity: 1 }],
        subtotal: 100,
      };
      mockCartRepo.findByIdentifier.mockResolvedValue(mockCart);
      mockAddressRepo.findAddressByIdAndUserIdDetail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        checkoutService.createOrder(userId, {
          addressId: 'invalid-addr',
          paymentMethodIdentifier: 'pix',
        })
      ).rejects.toThrow(/endereço/i);
    });

    it('should throw error when payment method is disabled', async () => {
      // Arrange
      const mockCart = {
        items: [{ productId: 'p1', quantity: 1 }],
        subtotal: 100,
      };
      mockCartRepo.findByIdentifier.mockResolvedValue(mockCart);
      mockAddressRepo.findAddressByIdAndUserIdDetail.mockResolvedValue(mockAddress);
      mockPaymentMethodRepo.findByIdentifier.mockResolvedValue({
        identifier: 'pix',
        isEnabled: false,
      });

      // Act & Assert
      await expect(
        checkoutService.createOrder(userId, {
          addressId: 'addr123',
          paymentMethodIdentifier: 'pix',
        })
      ).rejects.toThrow(/indisponível/i);
    });

    it('should generate sequential order numbers', async () => {
      // Arrange
      const mockCart = {
        items: [{ productId: 'p1', quantity: 1, unitPrice: 100, totalItemPrice: 100 }],
        subtotal: 100,
        itemsDiscount: 0,
        total: 100,
        save: vi.fn().mockReturnThis(),
      };

      mockCartRepo.findByIdentifier.mockResolvedValue(mockCart);
      mockAddressRepo.findAddressByIdAndUserIdDetail.mockResolvedValue(mockAddress);
      mockPaymentMethodRepo.findByIdentifier.mockResolvedValue(mockPaymentMethod);

      // Simulate existing order from today
      const today = new Date();
      const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      mockOrderRepo.findLastByDatePrefix.mockResolvedValue({
        orderNumber: `${datePrefix}-0005`,
      });

      mockPixService.processPixPayment.mockResolvedValue({ method: 'pix' });
      mockOrderRepo.createOrderTransactional.mockResolvedValue({
        _id: 'order123',
        orderNumber: `${datePrefix}-0006`,
        status: OrderStatus.AWAITING_PAYMENT,
        createdAt: new Date(),
        shippingAddress: mockAddress,
        items: [],
        totals: { total: 100 },
        payment: { method: 'pix' },
      });

      // Act
      await checkoutService.createOrder(userId, {
        addressId: 'addr123',
        paymentMethodIdentifier: 'pix',
      });

      // Assert - Order number should be sequential (0006 after 0005)
      expect(mockOrderRepo.createOrderTransactional).toHaveBeenCalledWith(
        expect.objectContaining({
          orderNumber: `${datePrefix}-0006`,
        })
      );
    });
  });

  describe('previewCoupon', () => {
    it('should calculate discount correctly for percentage coupon', async () => {
      // Arrange
      const mockCart = {
        items: [{ productId: 'p1', quantity: 1, totalItemPrice: 200 }],
        subtotal: 200,
        itemsDiscount: 0,
      };

      const mockCoupon = {
        code: 'SAVE20',
        type: 'percentage',
        value: 20, // 20%
        minPurchaseValue: 100,
      };

      mockCartRepo.findByIdentifier.mockResolvedValue(mockCart);
      mockCouponRepo.findByCode.mockResolvedValue(mockCoupon);

      // Act
      const result = await checkoutService.previewCoupon('user123', 'SAVE20');

      // Assert
      expect(result.data.subtotal).toBe(200);
      expect(result.data.discount).toBe(40); // 20% of 200
      expect(result.data.total).toBe(160); // 200 - 40
    });

    it('should throw error when minimum purchase not met', async () => {
      // Arrange
      const mockCart = {
        items: [{ productId: 'p1', quantity: 1, totalItemPrice: 30 }],
        subtotal: 30,
        itemsDiscount: 0,
      };

      const mockCoupon = {
        code: 'SAVE20',
        minPurchaseValue: 100,
      };

      mockCartRepo.findByIdentifier.mockResolvedValue(mockCart);
      mockCouponRepo.findByCode.mockResolvedValue(mockCoupon);

      // Act & Assert
      await expect(checkoutService.previewCoupon('user123', 'SAVE20')).rejects.toThrow(
        /valor mínimo/i
      );
    });
  });
});
