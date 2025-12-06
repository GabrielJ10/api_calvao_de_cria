import paymentMethodRepository, {
  IPaymentMethodRepository,
} from '../../repositories/paymentMethod.repository';
import AppError from '../../utils/AppError';
import { IPaymentMethod } from '../../models/paymentMethod.model';

export interface IPaymentMethodAdminService {
  listPaymentMethods(): Promise<any>;
  createPaymentMethod(data: Partial<IPaymentMethod>): Promise<any>;
  updatePaymentMethod(methodId: string, updateData: Partial<IPaymentMethod>): Promise<any>;
}

export class PaymentMethodAdminService implements IPaymentMethodAdminService {
  constructor(private paymentMethodRepository: IPaymentMethodRepository) {}

  async listPaymentMethods() {
    const methods = await this.paymentMethodRepository.findAll();
    return { data: methods, message: 'Métodos de pagamento retornados com sucesso.' };
  }

  async createPaymentMethod(data: Partial<IPaymentMethod>) {
    const newMethod = await this.paymentMethodRepository.create(data);
    return { data: newMethod, message: 'Método de pagamento criado com sucesso.' };
  }

  async updatePaymentMethod(methodId: string, updateData: Partial<IPaymentMethod>) {
    // Proíbe a alteração do campo 'identifier' após a criação
    if (updateData.identifier) {
      throw new AppError('O identificador não pode ser alterado após a criação.', 400);
    }

    const method = await this.paymentMethodRepository.updateById(methodId, updateData);
    if (!method) {
      throw new AppError('Método de pagamento não encontrado.', 404);
    }
    return { data: method, message: 'Método de pagamento atualizado com sucesso.' };
  }
}

export default new PaymentMethodAdminService(paymentMethodRepository);
