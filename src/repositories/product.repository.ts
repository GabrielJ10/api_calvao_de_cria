import Product, { IProduct } from '../models/product.model';

export interface IProductRepository {
  create(productData: Partial<IProduct>): Promise<IProduct>;
  findAllAdmin(
    filters: any,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ products: IProduct[]; total: number }>;
  findAllPublic(
    filters: any,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ products: IProduct[]; total: number }>;
  findByIdAdmin(productId: string): Promise<IProduct | null>;
  findByIdPublic(productId: string): Promise<IProduct | null>;
  updateById(productId: string, updateData: Partial<IProduct>): Promise<IProduct | null>;
  softDeleteById(productId: string): Promise<IProduct | null>;
  hardDeleteById(productId: string): Promise<IProduct | null>;
  findByImagePublicId(publicId: string, excludeProductId: string): Promise<IProduct[]>;
}

export class ProductRepository implements IProductRepository {
  async create(productData: Partial<IProduct>): Promise<IProduct> {
    return Product.create(productData);
  }

  async findAllAdmin(
    filters: any,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ products: IProduct[]; total: number }> {
    const query = Product.find(filters).sort(options.sort).skip(options.skip).limit(options.limit);

    const products = await query;
    const total = await Product.countDocuments(filters);

    return { products, total };
  }

  async findByIdAdmin(productId: string): Promise<IProduct | null> {
    return Product.findById(productId).select('+isActive');
  }

  async updateById(productId: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
  }

  // A função de deletar na verdade faz um soft delete
  async softDeleteById(productId: string): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(productId, { isActive: false });
  }

  async hardDeleteById(productId: string): Promise<IProduct | null> {
    return Product.findByIdAndDelete(productId);
  }

  async findByIdPublic(productId: string): Promise<IProduct | null> {
    return Product.findOne({ _id: productId });
  }

  async findByImagePublicId(publicId: string, excludeProductId: string): Promise<IProduct[]> {
    return Product.find({
      _id: { $ne: excludeProductId },
      'images.public_id': publicId,
    }).select('_id');
  }

  async findAllPublic(
    filters: any,
    options: { sort: any; skip: number; limit: number }
  ): Promise<{ products: IProduct[]; total: number }> {
    const publicFilters = { ...filters, isActive: true };

    const query = Product.find(publicFilters)
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit);

    const products = await query;
    const total = await Product.countDocuments(publicFilters);

    return { products, total };
  }
}

// Export default instance for backward compatibility
export default new ProductRepository();
