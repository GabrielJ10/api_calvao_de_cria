const { v4: uuidv4 } = require('uuid');
const cartRepository = require('../repositories/cart.repository');
const productRepository = require('../repositories/product.repository');
const couponRepository = require('../repositories/coupon.repository');
const AppError = require('../utils/AppError');
const cartTransformer = require('../utils/transformers/cart.transformer');

// --- Funções Auxiliares Internas ---

/**
 * Obtém ou cria um carrinho com base no identificador (userId ou guestCartId).
 * @param {object} identifier - O objeto de identificação { userId, guestCartId }.
 * @returns {Promise<{cart: Document, newGuestCartId?: string}>} O documento do carrinho e o ID de convidado, se um novo foi criado.
 */
const getOrCreateCart = async (identifier) => {
  let cart = await cartRepository.findByIdentifier(identifier);
  let newGuestCartId = null;

  if (!cart) {
    if (identifier.userId) {
      cart = await cartRepository.create({ userId: identifier.userId });
    } else {
      newGuestCartId = uuidv4();
      cart = await cartRepository.create({ guestCartId: newGuestCartId });
    }
  }
  return { cart, newGuestCartId };
};

/**
 * Revalida o cupom ativo em um carrinho e ajusta os descontos.
 * @param {Document} cart - O documento do carrinho.
 * @returns {Promise<{isValid: boolean, reason?: string}>} Um objeto indicando se o cupom ainda é válido.
 */
const revalidateCouponOnCart = async (cart) => {
  if (!cart.activeCouponCode) {
    return { isValid: true };
  }

  const coupon = await couponRepository.findByCode(cart.activeCouponCode);
  const subtotalAfterItemDiscounts = cart.items.reduce((sum, item) => sum + item.totalItemPrice, 0);

  if (!coupon || subtotalAfterItemDiscounts < coupon.minPurchaseValue) {
    cart.couponDiscount = 0;
    cart.activeCouponCode = null;
    cart.couponInfo = null;
    return {
      isValid: false,
      reason: 'O cupom foi removido pois os requisitos de compra não são mais atendidos.',
    };
  }

  if (coupon.type === 'fixed') {
    cart.couponDiscount = Math.min(coupon.value, subtotalAfterItemDiscounts);
  } else {
    cart.couponDiscount = (subtotalAfterItemDiscounts * coupon.value) / 100;
  }
  return { isValid: true };
};


// --- Serviços Exportados ---

const getCart = async (identifier) => {
  const { cart } = await getOrCreateCart(identifier);
  return { data: cartTransformer.transform(cart) };
};

const addItemToCart = async (identifier, { productId, quantity }) => {
  const product = await productRepository.findByIdPublic(productId);
  if (!product) throw new AppError('Produto não encontrado.', 404);

  const { cart, newGuestCartId } = await getOrCreateCart(identifier);
  let details = null;

  const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

  if (existingItemIndex > -1) {
    const item = cart.items[existingItemIndex];
    const newQuantity = item.quantity + quantity;
    if (product.stockQuantity < newQuantity) {
      throw new AppError('Estoque insuficiente para a quantidade desejada.', 409);
    }
    item.quantity = newQuantity;
    item.totalItemPrice = newQuantity * item.unitPrice;
  } else {
    if (product.stockQuantity < quantity) {
      throw new AppError('Quantidade solicitada excede o estoque disponível.', 409);
    }
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

  const couponValidation = await revalidateCouponOnCart(cart);
  if (!couponValidation.isValid) {
    details = { couponStatus: 'REMOVED', reason: couponValidation.reason };
  }

  const updatedCart = await cart.save();

  return { data: cartTransformer.transform(updatedCart), newGuestCartId, details };
};

const updateItemQuantity = async (identifier, productId, quantity) => {
    const { cart } = await getOrCreateCart(identifier);
    let details = null;
  
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex === -1) throw new AppError('Produto não encontrado no carrinho.', 404);
  
    const product = await productRepository.findByIdPublic(productId);
    if (!product) throw new AppError('Produto não existe mais no catálogo.', 404);
    if (product.stockQuantity < quantity) throw new AppError('A nova quantidade excede o estoque disponível.', 409);
  
    const item = cart.items[itemIndex];
    item.quantity = quantity;
    item.totalItemPrice = quantity * item.unitPrice;
  
    const couponValidation = await revalidateCouponOnCart(cart);
    if (!couponValidation.isValid) {
        details = { couponStatus: 'REMOVED', reason: couponValidation.reason };
    }

    const updatedCart = await cart.save();
  
    return { data: cartTransformer.transform(updatedCart), details };
};

const removeItemFromCart = async (identifier, productId) => {
    const { cart } = await getOrCreateCart(identifier);
    let details = null;

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    if (cart.items.length === initialLength) throw new AppError('Produto não encontrado no carrinho.', 404);

    const couponValidation = await revalidateCouponOnCart(cart);
    if (!couponValidation.isValid) {
        details = { couponStatus: 'REMOVED', reason: couponValidation.reason };
    }

    const updatedCart = await cart.save();

    return { data: cartTransformer.transform(updatedCart), details };
};

const mergeCarts = async (userId, guestCartId) => {
    const guestCart = await cartRepository.findByGuestCartId(guestCartId);
    if (!guestCart || guestCart.items.length === 0) {
        const { cart: userCart } = await getOrCreateCart({ userId });
        return { data: cartTransformer.transform(userCart) };
    }

    const { cart: userCart } = await getOrCreateCart({ userId });

    for (const guestItem of guestCart.items) {
        const existingItemIndex = userCart.items.findIndex(item => item.productId.toString() === guestItem.productId.toString());
        if (existingItemIndex > -1) {
            const userItem = userCart.items[existingItemIndex];
            userItem.quantity += guestItem.quantity;
            userItem.totalItemPrice = userItem.quantity * userItem.unitPrice;
        } else {
            userCart.items.push(guestItem);
        }
    }

    await revalidateCouponOnCart(userCart);
    const updatedUserCart = await userCart.save();
    await cartRepository.deleteByGuestCartId(guestCartId);

    return { data: cartTransformer.transform(updatedUserCart) };
};

const applyCoupon = async (identifier, couponCode) => {
    const { cart } = await getOrCreateCart(identifier);
    const coupon = await couponRepository.findByCode(couponCode);

    const subtotalAfterItemDiscounts = cart.items.reduce((sum, item) => sum + item.totalItemPrice, 0);

    if (!coupon) throw new AppError('Cupom inválido ou expirado.', 404);
    if (subtotalAfterItemDiscounts < coupon.minPurchaseValue) {
        throw new AppError(`O valor mínimo da compra para usar este cupom é de R$ ${coupon.minPurchaseValue.toFixed(2)}.`, 400);
    }
    
    cart.activeCouponCode = coupon.code;
    cart.couponInfo = { code: coupon.code, description: coupon.description };

    if (coupon.type === 'fixed') {
        cart.couponDiscount = Math.min(coupon.value, subtotalAfterItemDiscounts);
    } else {
        cart.couponDiscount = (subtotalAfterItemDiscounts * coupon.value) / 100;
    }
    
    const updatedCart = await cart.save();
    
    return { data: cartTransformer.transform(updatedCart) };
};

const removeCoupon = async (identifier) => {
    const { cart } = await getOrCreateCart(identifier);
    
    cart.couponDiscount = 0;
    cart.activeCouponCode = null;
    cart.couponInfo = null;

    const updatedCart = await cart.save();

    return { data: cartTransformer.transform(updatedCart) };
};


module.exports = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  mergeCarts,
  applyCoupon,
  removeCoupon,
};