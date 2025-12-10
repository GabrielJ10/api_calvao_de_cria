import orderRepository, { IOrderRepository } from '../repositories/order.repository';
import AppError from '../utils/AppError';
import orderTransformer from '../utils/transformers/order.transformer';
import { ServiceResponse, ServiceResponseWithPagination } from '../types/service.types';

export interface IOrderService {
  listUserOrders(userId: string, queryParams: any): Promise<ServiceResponseWithPagination<any[]>>;
  getUserOrderDetails(userId: string, orderId: string): Promise<ServiceResponse<any>>;
}

export class OrderService implements IOrderService {
  constructor(private orderRepository: IOrderRepository) {}

  async listUserOrders(userId: string, queryParams: any) {
    const limit = parseInt(queryParams.limit, 10) || 10;
    const page = parseInt(queryParams.page, 10) || 1;
    const skip = (page - 1) * limit;
    const options = { limit, skip, sort: { createdAt: 'desc' } };

    const { orders, total } = await this.orderRepository.findAllByUserId(userId, options);

    const transformedOrders = orders.map(orderTransformer.transformOrderForCustomer);

    const details = {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    };

    return { data: transformedOrders, details, message: 'Pedidos retornados com sucesso.' };
  }

  async getUserOrderDetails(userId: string, orderId: string) {
    const order = await this.orderRepository.findByIdAndUserId(orderId, userId);

    if (!order) {
      throw new AppError('Pedido não encontrado ou não pertence a este usuário.', 404);
    }

    return {
      data: orderTransformer.transformOrderForCustomer(order),
      message: 'Detalhes do pedido retornados com sucesso.',
    };
  }
}

export default new OrderService(orderRepository);
