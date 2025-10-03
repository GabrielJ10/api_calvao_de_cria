const orderRepository = require('../repositories/order.repository');
const AppError = require('../utils/AppError');
const orderTransformer = require('../utils/transformers/order.transformer');

const listUserOrders = async (userId, queryParams) => {
    const limit = parseInt(queryParams.limit, 10) || 10;
    const page = parseInt(queryParams.page, 10) || 1;
    const skip = (page - 1) * limit;
    const options = { limit, skip, sort: { createdAt: 'desc' } };

    const { orders, total } = await orderRepository.findAllByUserId(userId, options);

    const transformedOrders = orders.map(orderTransformer.transformOrderForCustomer);

    const details = {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
    };

    return { data: transformedOrders, details, message: 'Pedidos retornados com sucesso.' };
};

const getUserOrderDetails = async (userId, orderId) => {
    const order = await orderRepository.findByIdAndUserId(orderId, userId);

    if (!order) {
        throw new AppError('Pedido não encontrado ou não pertence a este usuário.', 404);
    }

    return {
        data: orderTransformer.transformOrderForCustomer(order),
        message: 'Detalhes do pedido retornados com sucesso.',
    };
};

module.exports = {
    listUserOrders,
    getUserOrderDetails,
};