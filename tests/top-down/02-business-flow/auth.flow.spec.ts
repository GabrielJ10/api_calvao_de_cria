import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from '../../../src/services/auth.service';
import userRepository from '../../../src/repositories/user.repository';
import cartRepository from '../../../src/repositories/cart.repository';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Mock repositories
vi.mock('../../../src/repositories/user.repository');
vi.mock('../../../src/repositories/cart.repository');
vi.mock('../../../src/utils/email');

/**
 * Top-Down Level 2: Business Flow Tests
 *
 * Purpose: Test the business logic with real Service, but mocked Repository.
 * This level tests:
 * - Business rules (password hashing, token generation, validation)
 * - Service calling repository with correctly processed data
 * - Error handling for business rule violations
 */
describe('Auth Flow (Top-Down L2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default environment variables
    process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
    process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
  });

  describe('register', () => {
    it('should hash password before saving to repository', async () => {
      // Arrange
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'PlainTextPassword123!',
        cpf: '12345678901',
        phone: '11999999999',
      };

      // Use a real ObjectId for the mock
      const userId = new mongoose.Types.ObjectId();
      const createdUser = {
        _id: userId,
        id: userId.toString(),
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf,
        phone: userData.phone,
        role: 'customer',
        passwordHash: 'hashed_password_from_bcrypt',
      };

      vi.mocked(userRepository.createUser).mockResolvedValue(createdUser as any);
      vi.mocked(cartRepository.create).mockResolvedValue({} as any);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(userRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          passwordHash: expect.stringMatching(/^\$2[aby]\$/), // bcrypt hash pattern
        })
      );
      expect(result.data.user.email).toBe('new@example.com');
      expect(result.data.accessToken).toBeDefined();
      expect(result.data.refreshToken).toBeDefined();
    });

    it('should create empty cart after successful registration', async () => {
      // Arrange
      const userData = {
        name: 'New User',
        email: 'cart@example.com',
        password: 'Password123!',
        cpf: '12345678901',
        phone: '11999999999',
      };

      const userId = new mongoose.Types.ObjectId();
      const createdUser = {
        _id: userId,
        id: userId.toString(),
        name: userData.name,
        email: userData.email,
        role: 'customer',
      };

      vi.mocked(userRepository.createUser).mockResolvedValue(createdUser as any);
      vi.mocked(cartRepository.create).mockResolvedValue({} as any);

      // Act
      await authService.register(userData);

      // Assert - Cart should be created for new user
      expect(cartRepository.create).toHaveBeenCalledWith({
        userId: userId,
      });
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const userData = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'Password123!',
      };

      vi.mocked(userRepository.createUser).mockRejectedValue(
        new Error('Duplicate key error: email')
      );

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow(/Duplicate/i);
    });
  });

  describe('login', () => {
    it('should verify password correctly and return tokens', async () => {
      // Arrange
      const plainPassword = 'CorrectPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const userId = new mongoose.Types.ObjectId();
      const existingUser = {
        _id: userId,
        id: userId.toString(),
        name: 'Existing User',
        email: 'existing@example.com',
        passwordHash: hashedPassword,
        role: 'customer',
      };

      vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue(existingUser as any);
      vi.mocked(userRepository.updateById).mockResolvedValue(existingUser as any);

      // Act
      const result = await authService.login('existing@example.com', plainPassword);

      // Assert
      expect(result.data.accessToken).toBeDefined();
      expect(result.data.refreshToken).toBeDefined();
      expect(result.data.user.email).toBe('existing@example.com');

      // Verify refresh token hash was saved
      expect(userRepository.updateById).toHaveBeenCalledWith(
        userId.toString(),
        expect.objectContaining({
          currentRefreshTokenHash: expect.any(String),
        })
      );
    });

    it('should reject invalid password', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('RealPassword', 10);

      const userId = new mongoose.Types.ObjectId();
      const existingUser = {
        _id: userId,
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'customer',
      };

      vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue(existingUser as any);

      // Act & Assert
      await expect(authService.login('test@example.com', 'WrongPassword')).rejects.toThrow(
        /Credenciais inválidas/i
      );
    });

    it('should reject non-existent user', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login('nonexistent@example.com', 'AnyPassword')).rejects.toThrow(
        /Credenciais inválidas/i
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token for valid refresh token', async () => {
      // Arrange
      const jwt = await import('jsonwebtoken');
      const crypto = await import('crypto');

      const userId = new mongoose.Types.ObjectId().toString();
      const role = 'customer';
      const refreshToken = jwt.default.sign(
        { userId, role },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: '7d' }
      );

      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      const user = {
        _id: userId,
        id: userId,
        role,
        currentRefreshTokenHash: tokenHash,
      };

      vi.mocked(userRepository.findByIdWithRefreshToken).mockResolvedValue(user as any);

      // Act
      const result = await authService.refreshAccessToken(refreshToken);

      // Assert
      expect(result.data.accessToken).toBeDefined();
      expect(result.data.refreshToken).toBe(refreshToken); // Same refresh token returned
    });

    it('should reject reused/stolen refresh token (token rotation detection)', async () => {
      // Arrange
      const jwt = await import('jsonwebtoken');

      const userId = new mongoose.Types.ObjectId().toString();
      const refreshToken = jwt.default.sign(
        { userId, role: 'customer' },
        process.env.REFRESH_TOKEN_SECRET as string
      );

      // User has different hash stored (token was rotated)
      const user = {
        _id: userId,
        id: userId,
        role: 'customer',
        currentRefreshTokenHash: 'different_hash_from_newer_token',
      };

      vi.mocked(userRepository.findByIdWithRefreshToken).mockResolvedValue(user as any);

      // Act & Assert
      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
        /sessão é inválida/i
      );
    });
  });
});
