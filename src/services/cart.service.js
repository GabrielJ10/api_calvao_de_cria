const { v4: uuidv4 } = require('uuid');
const cartRepository = require('../repositories/cart.repository');
const productRepository = require('../repositories/product.repository');
const AppError = require('../utils/AppError');
const cartTransformer = require('../utils/transformers/cart.transformer');

// Função auxiliar para recalcular totais do carrinho
const recalculateCartTotals = (cart) => {
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.cartTotalPrice = cart.items.reduce((sum, item) => sum + item.totalItemPrice, 0);
  return cart;
};

const getCart = async (identifier) => {
  const cart = await cartRepository.findByIdentifier(identifier);
  if (identifier.guestCartId && !cart) {
    throw new AppError('Carrinho de convidado não encontrado.', 404);
  }

  // Se for um usuário logado sem carrinho, ou convidado sem carrinho, retorna um carrinho vazio
  if (!cart) {
    const emptyCart = identifier.userId
      ? { userId: identifier.userId, items: [], totalItems: 0, cartTotalPrice: 0 }
      : { guestCartId: identifier.guestCartId, items: [], totalItems: 0, cartTotalPrice: 0 };
    return { data: emptyCart };
  }

  return { data: cartTransformer.transform(cart) };
};

const addItemToCart = async (identifier, { productId, quantity }) => {
  const product = await productRepository.findByIdPublic(productId);
  if (!product) {
    throw new AppError('Produto não encontrado.', 404);
  }
  if (product.stockQuantity < quantity) {
    throw new AppError('Quantidade solicitada excede o estoque.', 409);
  }

  let cart = await cartRepository.findByIdentifier(identifier);
  let newGuestCartId = null;

  if (!cart) {
    if (identifier.guestCartId) {
        // Se um guestCartId foi fornecido mas não encontrado, cria um novo
        newGuestCartId = uuidv4();
        cart = await cartRepository.create({ guestCartId: newGuestCartId, items: [] });
    } else if (identifier.userId) {
        cart = await cartRepository.create({ userId: identifier.userId, items: [] });
    } else {
        newGuestCartId = uuidv4();
        cart = await cartRepository.create({ guestCartId: newGuestCartId, items: [] });
    }
}

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Se o item já existe, atualiza a quantidade
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    if (product.stockQuantity < newQuantity) {
      throw new AppError('Quantidade solicitada excede o estoque.', 409);
    }
    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].totalItemPrice =
      newQuantity * cart.items[existingItemIndex].unitPrice;
  } else {
    // Adiciona novo item ao carrinho
    const unitPrice = product.isPromotionActive ? product.promotionalPrice : product.price;
    cart.items.push({
      productId,
      name: product.name,
      mainImageUrl: product.mainImageUrl,
      quantity,
      price: product.price,
      promotionalPrice: product.promotionalPrice,
      unitPrice,
      totalItemPrice: quantity * unitPrice,
    });
  }

  recalculateCartTotals(cart);
  await cart.save();

  return {
    data: cartTransformer.transform(cart),
    newGuestCartId: newGuestCartId || (identifier.guestCartId && !cart ? identifier.guestCartId : null),
  };
};

const updateItemQuantity = async (identifier, productId, quantity) => {
    const cart = await cartRepository.findByIdentifier(identifier);
    if (!cart) {
      throw new AppError('Carrinho não encontrado.', 404);
    }
  
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex === -1) {
      throw new AppError('Produto não encontrado no carrinho.', 404);
    }
  
    const product = await productRepository.findByIdPublic(productId);
    if (!product) {
      throw new AppError('Produto não encontrado no catálogo.', 404);
    }
    if (product.stockQuantity < quantity) {
      throw new AppError('A nova quantidade excede o estoque disponível.', 409);
    }
  
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].totalItemPrice = quantity * cart.items[itemIndex].unitPrice;
  
    recalculateCartTotals(cart);
    await cart.save();
  
    return { data: cartTransformer.transform(cart) };
};
  
const removeItemFromCart = async (identifier, productId) => {
    const cart = await cartRepository.findByIdentifier(identifier);
    if (!cart) {
        throw new AppError('Carrinho não encontrado.', 404);
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    if (cart.items.length === initialLength) {
        throw new AppError('Produto não encontrado no carrinho.', 404);
    }

    recalculateCartTotals(cart);
    await cart.save();

    return { data: cartTransformer.transform(cart) };
};

const mergeCarts = async (userId, guestCartId) => {
    const guestCart = await cartRepository.findByGuestCartId(guestCartId);
    if (!guestCart) {
        throw new AppError('Carrinho de convidado não encontrado.', 404);
    }

    let userCart = await cartRepository.findByUserId(userId);
    if (!userCart) {
        userCart = await cartRepository.create({ userId, items: [] });
    }

    // Unifica os itens
    for (const guestItem of guestCart.items) {
        const existingItemIndex = userCart.items.findIndex(
            (item) => item.productId.toString() === guestItem.productId.toString()
        );

        if (existingItemIndex > -1) {
            // Se o item já existe, soma as quantidades
            userCart.items[existingItemIndex].quantity += guestItem.quantity;
            userCart.items[existingItemIndex].totalItemPrice =
                userCart.items[existingItemIndex].quantity * userCart.items[existingItemIndex].unitPrice;
        } else {
            // Adiciona o item do carrinho de convidado
            userCart.items.push(guestItem);
        }
    }

    recalculateCartTotals(userCart);
    await userCart.save();
    await cartRepository.deleteByGuestCartId(guestCartId);

    return { data: cartTransformer.transform(userCart) };
};
  
module.exports = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  mergeCarts
};