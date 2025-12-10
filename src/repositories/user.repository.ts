import User, { IUser } from '../models/user.model';

export interface IUserRepository {
  findByEmailWithPassword(email: string): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findByPasswordResetToken(hashedToken: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findByIdWithRole(id: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  findByIdWithPassword(id: string): Promise<IUser | null>;
  findByIdWithRefreshToken(id: string): Promise<IUser | null>;
  updateById(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
  emailExists(email: string): Promise<boolean>;
  cpfExists(cpf: string): Promise<boolean>;
  findAllCustomers(
    filters: any,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ users: IUser[]; total: number }>;
}

export class UserRepository implements IUserRepository {
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select('+passwordHash').select('+role');
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findByPasswordResetToken(hashedToken: string): Promise<IUser | null> {
    return User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findByIdWithRole(id: string): Promise<IUser | null> {
    return User.findById(id).select('+role');
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    return User.create(userData);
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).select('+passwordHash');
  }

  async findByIdWithRefreshToken(id: string): Promise<IUser | null> {
    return User.findById(id).select('+currentRefreshTokenHash');
  }

  async updateById(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ email });
    return !!user;
  }

  async cpfExists(cpf: string): Promise<boolean> {
    const user = await User.findOne({ cpf });
    return !!user;
  }

  async findAllCustomers(
    filters: any,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ users: IUser[]; total: number }> {
    const customerFilters = { ...filters, role: 'customer' };

    const query = User.find(customerFilters)
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit);

    const users = await query;
    const total = await User.countDocuments(customerFilters);
    return { users, total };
  }
}

// Export default instance for backward compatibility during refactor
export default new UserRepository();
