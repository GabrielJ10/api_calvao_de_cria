export interface ICreateProductDTO {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive?: boolean;
  category?: string;
  // Images are handled via req.files, but sometimes passed as metadata
}

export interface IUpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  isActive?: boolean;
  category?: string;
}

export interface IProductQueryDTO {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  isActive?: boolean;
}
