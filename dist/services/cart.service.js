"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const mongoose_1 = require("mongoose");
const cart_repository_1 = __importDefault(require("../repositories/cart.repository"));
const product_repository_1 = __importDefault(require("../repositories/product.repository"));
const coupon_repository_1 = __importDefault(require("../repositories/coupon.repository"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const cart_transformer_1 = __importDefault(require("../utils/transformers/cart.transformer"));
/**
 * Obtém ou cria um carrinho com base no identificador (userId ou guestCartId).
 */
const getOrCreateCart = async (identifier) => {
    let cart = await cart_repository_1.default.findByIdentifier(identifier);
    let newGuestCartId = undefined;
    if (!cart) {
        if (identifier.userId) {
            cart = await cart_repository_1.default.create({ userId: new mongoose_1.Types.ObjectId(identifier.userId) });
        }
        else {
            newGuestCartId = (0, uuid_1.v4)();
            cart = await cart_repository_1.default.create({ guestCartId: newGuestCartId });
        }
    }
    return { cart, newGuestCartId };
};
/**
 * Revalida o cupom ativo em um carrinho e ajusta os descontos.
 */
const revalidateCouponOnCart = async (cart) => {
    if (!cart.activeCouponCode) {
        return { isValid: true };
    }
    const coupon = await coupon_repository_1.default.findByCode(cart.activeCouponCode);
    const subtotalAfterItemDiscounts = cart.items.reduce((sum, item) => sum + item.totalItemPrice, 0);
    if (!coupon || subtotalAfterItemDiscounts < coupon.minPurchaseValue) {
        cart.couponDiscount = 0;
        cart.activeCouponCode = undefined;
        cart.couponInfo = undefined;
        // Mongoose types for undefined/null on string fields can be tricky if using simple assignment.
        // The model defines activeCouponCode as String. Mongoose typically interprets null as empty.
        return {
            isValid: false,
            reason: 'O cupom foi removido pois os requisitos de compra não são mais atendidos.',
        };
    }
    if (coupon.type === 'fixed') {
        cart.couponDiscount = Math.min(coupon.value, subtotalAfterItemDiscounts);
    }
    else {
        cart.couponDiscount = (subtotalAfterItemDiscounts * coupon.value) / 100;
    }
    return { isValid: true };
};
// --- Serviços Exportados ---
const getCart = async (identifier) => {
    const { cart } = await getOrCreateCart(identifier);
    return { data: cart_transformer_1.default.transform(cart) };
};
const addItemToCart = async (identifier, { productId, quantity }) => {
    const product = await product_repository_1.default.findByIdPublic(productId);
    if (!product)
        throw new AppError_1.default('Produto não encontrado.', 404);
    const { cart, newGuestCartId } = await getOrCreateCart(identifier);
    let details = null;
    const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (existingItemIndex > -1) {
        const item = cart.items[existingItemIndex];
        const newQuantity = item.quantity + quantity;
        if (product.stockQuantity < newQuantity) {
            throw new AppError_1.default('Estoque insuficiente para a quantidade desejada.', 409);
        }
        item.quantity = newQuantity;
        item.totalItemPrice = newQuantity * item.unitPrice;
    }
    else {
        if (product.stockQuantity < quantity) {
            throw new AppError_1.default('Quantidade solicitada excede o estoque disponível.', 409);
        }
        const unitPrice = product.isPromotionActive && product.promotionalPrice
            ? product.promotionalPrice
            : product.price;
        cart.items.push({
            productId: product._id,
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
    return { data: cart_transformer_1.default.transform(updatedCart), newGuestCartId, details };
};
const updateItemQuantity = async (identifier, productId, quantity) => {
    const { cart } = await getOrCreateCart(identifier);
    let details = null;
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex === -1)
        throw new AppError_1.default('Produto não encontrado no carrinho.', 404);
    const product = await product_repository_1.default.findByIdPublic(productId);
    if (!product)
        throw new AppError_1.default('Produto não existe mais no catálogo.', 404);
    if (product.stockQuantity < quantity)
        throw new AppError_1.default('A nova quantidade excede o estoque disponível.', 409);
    const item = cart.items[itemIndex];
    item.quantity = quantity;
    item.totalItemPrice = quantity * item.unitPrice;
    const couponValidation = await revalidateCouponOnCart(cart);
    if (!couponValidation.isValid) {
        details = { couponStatus: 'REMOVED', reason: couponValidation.reason };
    }
    const updatedCart = await cart.save();
    return { data: cart_transformer_1.default.transform(updatedCart), details };
};
const removeItemFromCart = async (identifier, productId) => {
    const { cart } = await getOrCreateCart(identifier);
    let details = null;
    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    if (cart.items.length === initialLength)
        throw new AppError_1.default('Produto não encontrado no carrinho.', 404);
    const couponValidation = await revalidateCouponOnCart(cart);
    if (!couponValidation.isValid) {
        details = { couponStatus: 'REMOVED', reason: couponValidation.reason };
    }
    const updatedCart = await cart.save();
    return { data: cart_transformer_1.default.transform(updatedCart), details };
};
const mergeCarts = async (userId, guestCartId) => {
    const guestCart = await cart_repository_1.default.findByGuestCartId(guestCartId);
    if (!guestCart || guestCart.items.length === 0) {
        const { cart: userCart } = await getOrCreateCart({ userId });
        return { data: cart_transformer_1.default.transform(userCart) };
    }
    const { cart: userCart } = await getOrCreateCart({ userId });
    for (const guestItem of guestCart.items) {
        const existingItemIndex = userCart.items.findIndex((item) => item.productId.toString() === guestItem.productId.toString());
        if (existingItemIndex > -1) {
            const userItem = userCart.items[existingItemIndex];
            userItem.quantity += guestItem.quantity;
            userItem.totalItemPrice = userItem.quantity * userItem.unitPrice;
        }
        else {
            userCart.items.push(guestItem);
        }
    }
    await revalidateCouponOnCart(userCart);
    const updatedUserCart = await userCart.save();
    await cart_repository_1.default.deleteByGuestCartId(guestCartId);
    return { data: cart_transformer_1.default.transform(updatedUserCart) };
};
const applyCoupon = async (identifier, couponCode) => {
    const { cart } = await getOrCreateCart(identifier);
    const coupon = await coupon_repository_1.default.findByCode(couponCode);
    const subtotalAfterItemDiscounts = cart.items.reduce((sum, item) => sum + item.totalItemPrice, 0);
    if (!coupon)
        throw new AppError_1.default('Cupom inválido ou expirado.', 404);
    if (subtotalAfterItemDiscounts < coupon.minPurchaseValue) {
        throw new AppError_1.default(`O valor mínimo da compra para usar este cupom é de R$ ${coupon.minPurchaseValue.toFixed(2)}.`, 400);
    }
    cart.activeCouponCode = coupon.code;
    cart.couponInfo = { code: coupon.code, description: coupon.description };
    if (coupon.type === 'fixed') {
        cart.couponDiscount = Math.min(coupon.value, subtotalAfterItemDiscounts);
    }
    else {
        cart.couponDiscount = (subtotalAfterItemDiscounts * coupon.value) / 100;
    }
    const updatedCart = await cart.save();
    return { data: cart_transformer_1.default.transform(updatedCart) };
};
const removeCoupon = async (identifier) => {
    const { cart } = await getOrCreateCart(identifier);
    cart.couponDiscount = 0;
    cart.activeCouponCode = undefined;
    cart.couponInfo = undefined;
    const updatedCart = await cart.save();
    return { data: cart_transformer_1.default.transform(updatedCart) };
};
exports.default = {
    getCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    mergeCarts,
    applyCoupon,
    removeCoupon,
};
