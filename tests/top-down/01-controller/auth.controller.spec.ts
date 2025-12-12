import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { AuthController } from '../../../src/controllers/auth.controller';
import { createMinimalApp, createMockServiceResponse } from '../helpers/createMinimalApp';
import { IAuthService } from '../../../src/services/auth.service';

// Mock the user repository to prevent database calls in validation
vi.mock('../../../src/repositories/user.repository', () => ({
  default: {
    emailExists: vi.fn().mockResolvedValue(false),
    cpfExists: vi.fn().mockResolvedValue(false),
  },
}));

/**
 * Top-Down Level 1: Controller Tests
 *
 * Purpose: Test the HTTP contract (request/response) without any business logic.
 * The service is completely mocked, so we're only testing:
 * - HTTP status codes
 * - Response structure
 * - That the controller calls the service with correct arguments
 */
describe('AuthController (Top-Down L1)', () => {
  let mockAuthService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    refreshAccessToken: ReturnType<typeof vi.fn>;
    forgotPassword: ReturnType<typeof vi.fn>;
    resetPassword: ReturnType<typeof vi.fn>;
  };
  let controller: AuthController;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthService = {
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refreshAccessToken: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
    };

    controller = new AuthController(mockAuthService as unknown as IAuthService);
  });

  describe('POST /api/v1/auth/register', () => {
    // Valid CPF for tests (using a known valid CPF)
    const validCpf = '529.982.247-25';

    it('should return 201 when registration is successful', async () => {
      // Arrange
      const mockUserData = {
        user: { userId: 'user123', email: 'test@example.com', name: 'Test User' },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockAuthService.register.mockResolvedValue({
        data: mockUserData,
        message: 'Usuário registrado com sucesso.',
        details: null,
      });

      const app = createMinimalApp({ authController: controller });

      const registerPayload = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        cpf: validCpf,
        phone: '11999999999',
        birthDate: '1990-01-01',
      };

      // Act
      const res = await request(app).post('/api/v1/auth/register').send(registerPayload);

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.data).toEqual(mockUserData);
      expect(res.body.message).toBe('Usuário registrado com sucesso.');
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' })
      );
    });

    it('should return 422 when validation fails', async () => {
      // Arrange
      const app = createMinimalApp({ authController: controller });

      // Missing required fields
      const invalidPayload = { email: 'invalid' };

      // Act
      const res = await request(app).post('/api/v1/auth/register').send(invalidPayload);

      // Assert
      expect(res.status).toBe(422);
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should return 500 when service throws unexpected error', async () => {
      // Arrange
      mockAuthService.register.mockRejectedValue(new Error('Unexpected error'));

      const app = createMinimalApp({ authController: controller });

      const registerPayload = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        cpf: validCpf,
        phone: '11999999999',
        birthDate: '1990-01-01',
      };

      // Act
      const res = await request(app).post('/api/v1/auth/register').send(registerPayload);

      // Assert
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 200 with tokens when login is successful', async () => {
      // Arrange
      const mockLoginResponse = {
        user: { userId: 'user123', email: 'test@example.com' },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockAuthService.login.mockResolvedValue({
        data: mockLoginResponse,
        message: 'Login realizado com sucesso.',
        details: null,
      });

      const app = createMinimalApp({ authController: controller });

      // Act
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!',
      });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBe('mock-access-token');
      expect(res.body.data.refreshToken).toBe('mock-refresh-token');
      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'Password123!');
    });

    it('should return 401 when credentials are invalid', async () => {
      // Arrange
      const AppError = (await import('../../../src/utils/AppError')).default;
      mockAuthService.login.mockRejectedValue(new AppError('Credenciais inválidas.', 401));

      const app = createMinimalApp({ authController: controller });

      // Act
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'WrongPassword',
      });

      // Assert
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Credenciais inválidas');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    // A valid JWT format for testing
    const validJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0MTIzIiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNjk2MjU5NjAwfQ.dummysignature123456789012345678901234567890';

    it('should return 200 with new access token', async () => {
      // Arrange
      mockAuthService.refreshAccessToken.mockResolvedValue({
        data: {
          accessToken: 'new-access-token',
          refreshToken: validJwt,
        },
        message: 'Token atualizado.',
        details: null,
      });

      const app = createMinimalApp({ authController: controller });

      // Act
      const res = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: validJwt,
      });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBe('new-access-token');
      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(validJwt);
    });

    it('should return 401 when refresh token is invalid', async () => {
      // Arrange
      const AppError = (await import('../../../src/utils/AppError')).default;
      mockAuthService.refreshAccessToken.mockRejectedValue(
        new AppError('Sua sessão é inválida ou expirou.', 401)
      );

      const app = createMinimalApp({ authController: controller });

      // Act
      const res = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: validJwt,
      });

      // Assert
      expect(res.status).toBe(401);
    });
  });
});
