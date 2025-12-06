import mongoose from 'mongoose';
import Order, { IOrder } from '../models/order.model';
import Product from '../models/product.model';
import Cart from '../models/cart.model';

export interface IOrderRepository {
  createOrderTransactional(orderData: Partial<IOrder>): Promise<IOrder>;
  findAllAdmin(
    filters: any,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ orders: IOrder[]; total: number }>;
  findByIdAdmin(orderId: string): Promise<IOrder | null>;
  updateByIdAdmin(orderId: string, updateData: any): Promise<IOrder | null>;
  findSummaryByUserId(userId: string): Promise<any>;
  findLastByDatePrefix(datePrefix: string): Promise<IOrder | null>;
  findAllByUserId(
    userId: string,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ orders: IOrder[]; total: number }>;
  findByIdAndUserId(orderId: string, userId: string): Promise<IOrder | null>;
}

export class OrderRepository implements IOrderRepository {
  /**
   * Cria um pedido, abate o estoque e limpa o carrinho de forma transacional.
   */
  async createOrderTransactional(orderData: Partial<IOrder>): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Criar o pedido
      const newOrder = new Order(orderData);
      await newOrder.save({ session });

      // 2. Abater o estoque de cada produto
      for (const item of newOrder.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: -item.quantity } },
          { session }
        );
      }

      // 3. Deletar o carrinho antigo
      if (orderData.userId) {
        await Cart.deleteOne({ userId: orderData.userId }).session(session);
        // 4. Criar um novo carrinho vazio
        await Cart.create([{ userId: orderData.userId }], { session });
      }

      await session.commitTransaction();
      return newOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error; // Propaga o erro para o service tratar
    } finally {
      session.endSession();
    }
  }

  /**
   * [ADMIN] Encontra todos os pedidos com filtros, paginação e dados do cliente.
   */
  async findAllAdmin(
    filters: any,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ orders: IOrder[]; total: number }> {
    const query = Order.find(filters)
      .populate('userId', 'name email') // Popula dados do cliente
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit);

    const orders = await query;
    const total = await Order.countDocuments(filters);
    return { orders, total };
  }

  /**
   * [ADMIN] Encontra um pedido pelo ID com os dados do cliente.
   */
  async findByIdAdmin(orderId: string): Promise<IOrder | null> {
    return Order.findById(orderId).populate('userId', 'name email');
  }

  /**
   * [ADMIN] Atualiza um pedido pelo ID.
   */
  async updateByIdAdmin(orderId: string, updateData: any): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * [ADMIN] Retorna um resumo dos pedidos de um usuário específico.
   */
  async findSummaryByUserId(userId: string): Promise<any> {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return {
        totalCount: 0,
        totalValue: 0,
        lastOrders: [],
      };
    }

    const totalValue = orders.reduce((sum, order) => sum + order.totals.total, 0);

    const lastOrders = orders.slice(0, 5).map((order) => ({
      // Retorna os últimos 5
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.totals.total,
      createdAt: order.createdAt,
    }));

    return {
      totalCount: orders.length,
      totalValue,
      lastOrders,
    };
  }

  async findLastByDatePrefix(datePrefix: string): Promise<IOrder | null> {
    return Order.findOne({ orderNumber: { $regex: `^${datePrefix}` } }).sort({ orderNumber: -1 });
  }

  /**
   * [CLIENTE] Encontra todos os pedidos de um usuário com paginação.
   */
  async findAllByUserId(
    userId: string,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ orders: IOrder[]; total: number }> {
    const filters = { userId };
    const query = Order.find(filters).sort(options.sort).skip(options.skip).limit(options.limit);

    const orders = await query;
    const total = await Order.countDocuments(filters);
    return { orders, total };
  }

  /**
   * [CLIENTE] Encontra um pedido específico pelo seu ID e pelo ID do usuário.
   */
  async findByIdAndUserId(orderId: string, userId: string): Promise<IOrder | null> {
    return Order.findOne({ _id: orderId, userId });
  }
}

// Export default instance for backward compatibility
export default new OrderRepository();
