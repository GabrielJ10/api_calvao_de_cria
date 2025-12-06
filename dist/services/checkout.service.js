"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cart_repository_1 = __importDefault(require("../repositories/cart.repository"));
const address_repository_1 = __importDefault(require("../repositories/address.repository"));
const paymentMethod_repository_1 = __importDefault(require("../repositories/paymentMethod.repository"));
const order_repository_1 = __importDefault(require("../repositories/order.repository"));
const coupon_repository_1 = __importDefault(require("../repositories/coupon.repository"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const order_transformer_1 = __importDefault(require("../utils/transformers/order.transformer"));
const pix_service_1 = require("./payment/pix.service");
/**
 * Gera um número de pedido sequencial e amigável.
 * Ex: 20230923-0001
 */
const generateOrderNumber = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    // Esta busca pelo último pedido do dia pode ser otimizada em cenários de alta concorrência.
    const lastOrderToday = await order_repository_1.default.findLastByDatePrefix(datePrefix);
    let sequence = 1;
    if (lastOrderToday) {
        const lastSequence = parseInt(lastOrderToday.orderNumber.split('-')[1], 10);
        sequence = lastSequence + 1;
    }
    const sequenceString = String(sequence).padStart(4, '0');
    return `${datePrefix}-${sequenceString}`;
};
const getPaymentMethods = async () => {
    const methods = await paymentMethod_repository_1.default.findAllEnabled();
    return { data: methods, message: 'Métodos de pagamento retornados com sucesso.' };
};
const previewCoupon = async (userId, couponCode) => {
    const cart = await cart_repository_1.default.findByIdentifier({ userId });
    if (!cart || cart.items.length === 0) {
        throw new AppError_1.default('Seu carrinho está vazio.', 400);
    }
    const coupon = await coupon_repository_1.default.findByCode(couponCode);
    if (!coupon) {
        throw new AppError_1.default('Cupom inválido ou expirado.', 404);
    }
    const subtotal = cart.subtotal - cart.itemsDiscount;
    if (subtotal < coupon.minPurchaseValue) {
        throw new AppError_1.default(`O valor mínimo da compra para este cupom é R$ ${coupon.minPurchaseValue.toFixed(2)}.`, 400);
    }
    let discount = 0;
    if (coupon.type === 'fixed') {
        discount = Math.min(coupon.value, subtotal);
    }
    else {
        // percentage
        discount = (subtotal * coupon.value) / 100;
    }
    const total = subtotal - discount;
    return {
        data: {
            subtotal: parseFloat(subtotal.toFixed(2)),
            discount: parseFloat(discount.toFixed(2)),
            shipping: 0,
            total: parseFloat(total.toFixed(2)),
            coupon: {
                code: coupon.code,
                message: 'Cupom aplicado com sucesso!',
            },
        },
    };
};
const createOrder = async (userId, { addressId, paymentMethodIdentifier, couponCode, }) => {
    // 1. Validar Carrinho
    const cart = await cart_repository_1.default.findByIdentifier({ userId });
    if (!cart || cart.items.length === 0) {
        throw new AppError_1.default('Seu carrinho está vazio para finalizar a compra.', 400); //  { errorCode: 'EMPTY_CART' } - passing 3 args to AppError(msg, status) might be custom? AppError definition only has 2 arg in constructor.
    }
    // 2. Validar Endereço
    const address = await address_repository_1.default.findAddressByIdAndUserIdDetail(addressId, userId);
    if (!address) {
        throw new AppError_1.default('Endereço de entrega não encontrado ou não pertence a este usuário.', 404);
    }
    // 3. Validar Método de Pagamento
    const paymentMethod = await paymentMethod_repository_1.default.findByIdentifier(paymentMethodIdentifier);
    if (!paymentMethod || !paymentMethod.isEnabled) {
        throw new AppError_1.default('Método de pagamento inválido ou indisponível.', 400);
    }
    // 4. LÓGICA REVISADA: Validar e Aplicar Cupom diretamente aqui
    if (couponCode) {
        const coupon = await coupon_repository_1.default.findByCode(couponCode);
        const subtotalAfterItemDiscounts = cart.items.reduce((sum, item) => sum + item.totalItemPrice, 0);
        if (!coupon) {
            throw new AppError_1.default('Cupom inválido ou expirado.', 400);
        }
        if (subtotalAfterItemDiscounts < coupon.minPurchaseValue) {
            throw new AppError_1.default(`O valor mínimo da compra para usar este cupom é de R$ ${coupon.minPurchaseValue.toFixed(2)}.`, 400);
        }
        cart.activeCouponCode = coupon.code;
        cart.couponInfo = { code: coupon.code, description: coupon.description };
        if (coupon.type === 'fixed') {
            cart.couponDiscount = Math.min(coupon.value, subtotalAfterItemDiscounts);
        }
        else {
            // percentage
            cart.couponDiscount = (subtotalAfterItemDiscounts * coupon.value) / 100;
        }
    }
    else {
        // Garante que nenhum cupom antigo permaneça no carrinho
        cart.activeCouponCode = undefined;
        cart.couponInfo = undefined;
        cart.couponDiscount = 0;
    }
    // 5. RECALCULAR E SALVAR: Persiste as alterações e aciona o hook pre('save') do Mongoose
    // Isso garante que todos os totais sejam recalculados com o desconto do cupom.
    const finalCart = await cart.save();
    // 6. Gerar o número do pedido
    const orderNumber = await generateOrderNumber();
    // --- INTEGRAÇÃO DO PAGAMENTO PROFISSIONAL ---
    // 7. Processar Pagamento
    let paymentData;
    if (paymentMethod.identifier === 'pix') {
        paymentData = await (0, pix_service_1.processPixPayment)({
            recipientName: address.recipientName,
            total: finalCart.total,
            orderNumber: orderNumber,
        });
    }
    else {
        throw new AppError_1.default('Outros métodos de pagamento ainda não implementados.', 501);
    }
    // --- FIM DA INTEGRAÇÃO ---
    // 6. Estruturar dados do pedido (usando o carrinho agora correto)
    const orderData = {
        orderNumber: orderNumber,
        userId: userId,
        status: 'AWAITING_PAYMENT',
        items: finalCart.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            mainImageUrl: item.mainImageUrl,
            quantity: item.quantity,
            priceAtTimeOfPurchase: item.unitPrice,
            totalItemPrice: item.totalItemPrice,
        })),
        shippingAddress: {
            recipientName: address.recipientName,
            street: address.street,
            number: address.number,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            cep: address.cep,
            phone: address.phone,
        },
        totals: {
            subtotal: finalCart.subtotal,
            itemsDiscount: finalCart.itemsDiscount,
            couponDiscount: finalCart.couponDiscount,
            totalDiscount: finalCart.totalDiscount,
            total: finalCart.total,
        },
        payment: paymentData,
    };
    // 7. Criar o pedido de forma transacional
    const newOrder = await order_repository_1.default.createOrderTransactional(orderData);
    // 8. Transformar e retornar a resposta
    return {
        data: order_transformer_1.default.transformOrderForCustomer(newOrder),
        message: 'Pedido criado com sucesso.',
    };
};
exports.default = {
    getPaymentMethods,
    previewCoupon,
    createOrder,
};
