import Coupon, { ICoupon } from '../models/coupon.model';

export interface ICouponRepository {
  findByCode(code: string): Promise<ICoupon | null>;
  findByCodeAdmin(code: string): Promise<ICoupon | null>;
  create(couponData: Partial<ICoupon>): Promise<ICoupon>;
  findAll(
    filters: any,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ coupons: ICoupon[]; total: number }>;
  findById(id: string): Promise<ICoupon | null>;
  updateById(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null>;
  deleteById(id: string): Promise<ICoupon | null>;
}

export class CouponRepository implements ICouponRepository {
  /**
   * [PUBLIC] Encontra um cupom ativo pelo seu código.
   */
  async findByCode(code: string): Promise<ICoupon | null> {
    return Coupon.findOne({ code, isActive: true, expiresAt: { $gt: new Date() } });
  }

  /**
   * [ADMIN] Encontra um cupom pelo código, independentemente do status.
   */
  async findByCodeAdmin(code: string): Promise<ICoupon | null> {
    return Coupon.findOne({ code });
  }

  /**
   * [ADMIN] Cria um novo cupom.
   */
  async create(couponData: Partial<ICoupon>): Promise<ICoupon> {
    return Coupon.create(couponData);
  }

  /**
   * [ADMIN] Retorna todos os cupons com filtros e paginação.
   */
  async findAll(
    filters: any,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ coupons: ICoupon[]; total: number }> {
    const query = Coupon.find(filters).sort(options.sort).skip(options.skip).limit(options.limit);
    const coupons = await query;
    const total = await Coupon.countDocuments(filters);
    return { coupons, total };
  }

  /**
   * [ADMIN] Encontra um cupom pelo seu ID.
   */
  async findById(id: string): Promise<ICoupon | null> {
    return Coupon.findById(id);
  }

  /**
   * [ADMIN] Atualiza um cupom pelo seu ID.
   */
  async updateById(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
    return Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  /**
   * [ADMIN] Deleta um cupom pelo seu ID.
   */
  async deleteById(id: string): Promise<ICoupon | null> {
    return Coupon.findByIdAndDelete(id);
  }
}

// Export default instance for backward compatibility
export default new CouponRepository();
