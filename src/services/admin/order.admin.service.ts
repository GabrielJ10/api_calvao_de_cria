import orderRepository, { IOrderRepository } from '../../repositories/order.repository';
import AppError from '../../utils/AppError';

export interface IOrderAdminService {
  listAllOrders(queryParams: any): Promise<any>;
  getOrderDetails(orderId: string): Promise<any>;
  updateOrder(orderId: string, updateData: any): Promise<any>;
}

export class OrderAdminService implements IOrderAdminService {
  constructor(private orderRepository: IOrderRepository) {}

  // Transformer local para formatar a saída conforme a documentação
  private transformOrderForAdminList(order: any) {
    return {
      id: order._id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customer: {
        name: order.userId.name,
        email: order.userId.email,
      },
      total: order.totals.total,
      status: order.status,
    };
  }

  async listAllOrders(queryParams: any) {
    const filters: any = {};
    if (queryParams.status) {
      filters.status = queryParams.status.toUpperCase();
    }
    if (queryParams.search) {
      // Busca por número do pedido ou email do cliente
      filters.$or = [
        { orderNumber: { $regex: queryParams.search, $options: 'i' } },
        // A busca no email requer uma agregação mais complexa ou um campo denormalizado.
        // Por simplicidade, vamos buscar pelo número do pedido por enquanto.
      ];
    }

    const limit = parseInt(queryParams.limit, 10) || 20;
    const page = parseInt(queryParams.page, 10) || 1;
    const skip = (page - 1) * limit;

    const sortField = queryParams.sortBy || 'createdAt';
    const sortOrder = queryParams.order || 'desc';
    const options = { limit, skip, sort: { [sortField]: sortOrder } as any };

    const { orders, total } = await this.orderRepository.findAllAdmin(filters, options);

    const transformedOrders = orders.map(this.transformOrderForAdminList);

    const details = {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    };

    return { data: transformedOrders, details, message: 'Pedidos retornados com sucesso.' };
  }

  async getOrderDetails(orderId: string) {
    const order = await this.orderRepository.findByIdAdmin(orderId);
    if (!order) {
      throw new AppError('Pedido não encontrado.', 404);
    }
    return { data: order, message: 'Detalhes do pedido retornados com sucesso.' };
  }

  async updateOrder(orderId: string, updateData: any) {
    const order = await this.orderRepository.updateByIdAdmin(orderId, updateData);
    if (!order) {
      throw new AppError('Pedido não encontrado.', 404);
    }
    return { data: order, message: 'Pedido atualizado com sucesso.' };
  }
}

export default new OrderAdminService(orderRepository);
