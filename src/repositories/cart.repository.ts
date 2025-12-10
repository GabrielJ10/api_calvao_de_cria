import Cart, { ICart } from '../models/cart.model';

export interface ICartRepository {
  findByIdentifier(identifier: { userId?: string; guestCartId?: string }): Promise<ICart | null>;
  findByGuestCartId(guestCartId: string): Promise<ICart | null>;
  create(cartData: Partial<ICart>): Promise<ICart>;
  deleteByGuestCartId(guestCartId: string): Promise<any>;
}

export class CartRepository implements ICartRepository {
  /**
   * Encontra um carrinho pelo seu identificador (userId ou guestCartId).
   */
  async findByIdentifier({
    userId,
    guestCartId,
  }: {
    userId?: string;
    guestCartId?: string;
  }): Promise<ICart | null> {
    if (userId) {
      return Cart.findOne({ userId });
    }
    if (guestCartId) {
      return Cart.findOne({ guestCartId });
    }
    return null;
  }

  /**
   * Encontra um carrinho pelo ID de convidado.
   */
  async findByGuestCartId(guestCartId: string): Promise<ICart | null> {
    return Cart.findOne({ guestCartId });
  }

  /**
   * Cria um novo carrinho no banco de dados.
   */
  async create(cartData: Partial<ICart>): Promise<ICart> {
    return Cart.create(cartData);
  }

  /**
   * Deleta um carrinho de convidado pelo seu ID.
   */
  async deleteByGuestCartId(guestCartId: string): Promise<any> {
    return Cart.deleteOne({ guestCartId });
  }
}

// Export default instance for backward compatibility
export default new CartRepository();
