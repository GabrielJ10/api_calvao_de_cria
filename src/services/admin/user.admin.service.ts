import userRepository, { IUserRepository } from '../../repositories/user.repository';
import addressRepository, { IAddressRepository } from '../../repositories/address.repository';
import orderRepository, { IOrderRepository } from '../../repositories/order.repository';
import authService, { IAuthService } from '../auth.service';
import AppError from '../../utils/AppError';
import userTransformer from '../../utils/transformers/user.transformer';
import { ServiceResponse, ServiceResponseWithPagination } from '../../types/service.types';

export interface IUserAdminService {
  listCustomers(queryParams: any): Promise<ServiceResponseWithPagination<any[]>>;
  getCustomerDetails360(userId: string): Promise<ServiceResponse<any>>;
  forcePasswordResetForUser(
    userId: string,
    protocol: string,
    host: string
  ): Promise<ServiceResponse<null>>;
}

export class UserAdminService implements IUserAdminService {
  constructor(
    private userRepository: IUserRepository,
    private addressRepository: IAddressRepository,
    private orderRepository: IOrderRepository,
    private authService: IAuthService
  ) {}

  async listCustomers(queryParams: any) {
    const filters: any = {};
    if (queryParams.search) {
      const searchRegex = { $regex: queryParams.search, $options: 'i' };
      filters.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const limit = parseInt(queryParams.limit, 10) || 20;
    const page = parseInt(queryParams.page, 10) || 1;
    const skip = (page - 1) * limit;
    const options = { limit, skip, sort: { createdAt: 'desc' } as any };

    const { users, total } = await this.userRepository.findAllCustomers(filters, options);

    const transformedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }));

    const details = {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    };

    return { data: transformedUsers, details, message: 'Clientes retornados com sucesso.' };
  }

  async getCustomerDetails360(userId: string) {
    const user = await this.userRepository.findByIdWithRole(userId);

    if (!user || user.role !== 'customer') {
      throw new AppError('Cliente não encontrado.', 404);
    }

    const addresses = await this.addressRepository.findAllAddressesByUserIdSummary(userId);
    const ordersSummary = await this.orderRepository.findSummaryByUserId(userId);

    const responseData = {
      profile: userTransformer.detailed(user),
      addresses: addresses.map((addr) => ({
        id: addr._id,
        alias: addr.alias,
        street: addr.street,
        city: addr.city,
      })),
      orders: {
        totalCount: ordersSummary.totalCount,
        totalValue: ordersSummary.totalValue,
        lastOrders: ordersSummary.lastOrders,
      },
    };

    return { data: responseData, message: 'Detalhes do cliente retornados com sucesso.' };
  }

  async forcePasswordResetForUser(userId: string, protocol: string, host: string) {
    const user = await this.userRepository.findByIdWithRole(userId);
    if (!user || user.role !== 'customer') {
      throw new AppError('Cliente não encontrado.', 404);
    }

    await this.authService.forgotPassword(user.email, protocol, host);
    return {
      data: null,
      message: 'E-mail de redefinição de senha foi enviado para o usuário.',
    };
  }
}

export default new UserAdminService(
  userRepository,
  addressRepository,
  orderRepository,
  authService
);
