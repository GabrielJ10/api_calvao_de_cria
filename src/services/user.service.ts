import userRepository, { IUserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import AppError from '../utils/AppError';
import userTransformer from '../utils/transformers/user.transformer';
import { IUser } from '../models/user.model';

export interface IUserService {
  getUserProfile(userId: string): Promise<any>;
  updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<any>;
  changePassword(userId: string, newPassword: any): Promise<any>;
}

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    return {
      user: userTransformer.detailed(user),
      tokens: null,
      message: null,
      details: null,
    };
  }

  async updateUserProfile(userId: string, updateData: Partial<IUser>) {
    const updatedUser = await this.userRepository.updateById(userId, updateData);
    if (!updatedUser) {
      throw new AppError('Não foi possível atualizar o perfil.', 500);
    }
    return {
      data: userTransformer.detailed(updatedUser),
      tokens: null,
      message: 'Perfil atualizado com sucesso.',
      details: null,
    };
  }

  async changePassword(userId: string, newPassword: any) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updateById(userId, { passwordHash });
    await this.userRepository.updateById(userId, { currentRefreshTokenHash: undefined });

    return {
      user: null,
      tokens: null,
      message: 'Senha alterada com sucesso.',
      details: null,
    };
  }
}

export default new UserService(userRepository);
