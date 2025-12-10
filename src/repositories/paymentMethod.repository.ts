import PaymentMethod, { IPaymentMethod } from '../models/paymentMethod.model';

export interface IPaymentMethodRepository {
  findAllEnabled(): Promise<IPaymentMethod[]>;
  findAll(): Promise<IPaymentMethod[]>;
  findById(id: string): Promise<IPaymentMethod | null>;
  findByIdentifier(identifier: string): Promise<IPaymentMethod | null>;
  create(data: Partial<IPaymentMethod>): Promise<IPaymentMethod>;
  updateById(id: string, updateData: Partial<IPaymentMethod>): Promise<IPaymentMethod | null>;
}

export class PaymentMethodRepository implements IPaymentMethodRepository {
  /**
   * Retorna todos os métodos de pagamento ativos para os clientes.
   */
  async findAllEnabled(): Promise<IPaymentMethod[]> {
    return PaymentMethod.find({ isEnabled: true }).sort({ name: 1 });
  }

  /**
   * Retorna todos os métodos de pagamento para o painel de admin.
   */
  async findAll(): Promise<IPaymentMethod[]> {
    return PaymentMethod.find().sort({ name: 1 });
  }

  /**
   * [ADMIN] Encontra um método de pagamento pelo seu ID.
   */
  async findById(id: string): Promise<IPaymentMethod | null> {
    return PaymentMethod.findById(id);
  }

  /**
   * [ADMIN] Encontra um método de pagamento pelo seu identificador único.
   */
  async findByIdentifier(identifier: string): Promise<IPaymentMethod | null> {
    return PaymentMethod.findOne({ identifier });
  }

  /**
   * [ADMIN] Cria um novo método de pagamento.
   */
  async create(data: Partial<IPaymentMethod>): Promise<IPaymentMethod> {
    return PaymentMethod.create(data);
  }

  /**
   * [ADMIN] Atualiza um método de pagamento pelo seu ID.
   */
  async updateById(
    id: string,
    updateData: Partial<IPaymentMethod>
  ): Promise<IPaymentMethod | null> {
    return PaymentMethod.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }
}

// Export default instance for backward compatibility
export default new PaymentMethodRepository();
