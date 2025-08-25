const productRepository = require('../../repositories/product.repository');
const AppError = require('../../utils/AppError');
const {
  transformProductForPublicList,
  transformProductForAdmin,
} = require('../../utils/transformers/product.transformer');

const createProduct = async (productData) => {
  const product = await productRepository.create(productData);

  return {
    data: transformProductForAdmin(product),
    message: 'Produto criado com sucesso.',
    details: null,
  };
};

const listProducts = async (queryParams) => {
  const filters = {};

  if (queryParams.search) {
    filters.name = { $regex: queryParams.search, $options: 'i' };
  }

  if (queryParams.isActive !== undefined) {
    filters.isActive = queryParams.isActive === 'true';
  }

  const limit = parseInt(queryParams.limit, 10) || 10;
  const page = parseInt(queryParams.page, 10) || 1;
  const skip = (page - 1) * limit;

  const sortField = queryParams.sortBy || 'createdAt';
  const sortOrder = queryParams.order || 'desc';
  const options = { limit, skip, sort: { [sortField]: sortOrder } };

  const { products, total } = await productRepository.findAllAdmin(filters, options);

  const productsTransformed = products.map(transformProductForPublicList);

  return {
    data: productsTransformed,
    message: 'Produtos retornados com sucesso.',
    details: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

const productDetails = async (productId) => {
  const product = await productRepository.findByIdPublic(productId);
  if (!product) {
    throw new AppError('Produto não encontrado.', 404);
  }

  return {
    data: transformProductForAdmin(product),
    message: 'Detalhes do produto retornados com sucesso.',
    details: null,
  };
};

const updateProduct = async (productId, updateData) => {
  const product = await productRepository.updateById(productId, updateData);
  if (!product) throw new AppError('Produto não encontrado.', 404);

  return {
    data: transformProductForAdmin(product),
    message: 'Produto atualizado com sucesso.',
    details: null,
  };
};
const deleteProduct = async (productId) => {
  const product = await productRepository.softDeleteById(productId);
  if (!product) throw new AppError('Produto não encontrado.', 404);

  return {
    data: null,
    message: 'Produto removido com sucesso.',
    details: null,
  };
};
module.exports = {
  createProduct,
  listProducts,
  productDetails,
  updateProduct,
  deleteProduct,
};
