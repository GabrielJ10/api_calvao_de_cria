import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { ProductController } from '../../../src/controllers/product.controller';
import { createMinimalApp, createMockServiceResponse } from '../helpers/createMinimalApp';
import { IProductService } from '../../../src/services/product.service';

/**
 * Top-Down Level 1: Controller Tests
 *
 * Purpose: Test the HTTP contract (request/response) without any business logic.
 * The service is completely mocked, so we're only testing:
 * - HTTP status codes
 * - Response structure
 * - That the controller calls the service with correct arguments
 */
describe('ProductController (Top-Down L1)', () => {
  let mockProductService: {
    listPublicProducts: ReturnType<typeof vi.fn>;
    getPublicProductDetails: ReturnType<typeof vi.fn>;
  };
  let controller: ProductController;

  beforeEach(() => {
    vi.clearAllMocks();

    mockProductService = {
      listPublicProducts: vi.fn(),
      getPublicProductDetails: vi.fn(),
    };

    controller = new ProductController(mockProductService as unknown as IProductService);
  });

  describe('GET /api/v1/products', () => {
    it('should return 200 with paginated products list', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 200 },
      ];
      const mockPagination = {
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
      };

      mockProductService.listPublicProducts.mockResolvedValue({
        data: mockProducts,
        message: 'Produtos listados com sucesso.',
        details: mockPagination,
      });

      const app = createMinimalApp({ productController: controller });

      // Act
      const res = await request(app).get('/api/v1/products').query({ page: 1, limit: 10 });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockProducts);
      expect(res.body.details).toEqual(mockPagination);
      expect(mockProductService.listPublicProducts).toHaveBeenCalledTimes(1);
      expect(mockProductService.listPublicProducts).toHaveBeenCalledWith(
        expect.objectContaining({ page: '1', limit: '10' })
      );
    });

    it('should pass search query to service', async () => {
      // Arrange
      mockProductService.listPublicProducts.mockResolvedValue(
        createMockServiceResponse([], 'Produtos listados.')
      );

      const app = createMinimalApp({ productController: controller });

      // Act
      const res = await request(app).get('/api/v1/products').query({ search: 'Camiseta' });

      // Assert
      expect(res.status).toBe(200);
      expect(mockProductService.listPublicProducts).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Camiseta' })
      );
    });

    it('should return 500 when service throws error', async () => {
      // Arrange
      mockProductService.listPublicProducts.mockRejectedValue(new Error('Database error'));

      const app = createMinimalApp({ productController: controller });

      // Act
      const res = await request(app).get('/api/v1/products');

      // Assert
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/v1/products/:productId', () => {
    it('should return 200 with product details', async () => {
      // Arrange
      const mockProduct = {
        id: 'prod123',
        name: 'Test Product',
        description: 'A great product',
        price: 99.99,
        stockQuantity: 10,
      };

      mockProductService.getPublicProductDetails.mockResolvedValue(
        createMockServiceResponse(mockProduct)
      );

      const app = createMinimalApp({ productController: controller });

      // Act
      const res = await request(app).get('/api/v1/products/prod123');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockProduct);
      expect(mockProductService.getPublicProductDetails).toHaveBeenCalledWith('prod123');
    });

    it('should return 404 when product not found', async () => {
      // Arrange
      const AppError = (await import('../../../src/utils/AppError')).default;
      mockProductService.getPublicProductDetails.mockRejectedValue(
        new AppError('Produto não encontrado.', 404)
      );

      const app = createMinimalApp({ productController: controller });

      // Act
      const res = await request(app).get('/api/v1/products/invalid-id');

      // Assert
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('não encontrado');
    });
  });
});
