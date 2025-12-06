"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = __importDefault(require("../../repositories/user.repository"));
const address_repository_1 = __importDefault(require("../../repositories/address.repository"));
const order_repository_1 = __importDefault(require("../../repositories/order.repository"));
const auth_service_1 = __importDefault(require("../auth.service"));
const AppError_1 = __importDefault(require("../../utils/AppError"));
const user_transformer_1 = __importDefault(require("../../utils/transformers/user.transformer"));
const listCustomers = async (queryParams) => {
    const filters = {};
    if (queryParams.search) {
        const searchRegex = { $regex: queryParams.search, $options: 'i' };
        filters.$or = [{ name: searchRegex }, { email: searchRegex }];
    }
    const limit = parseInt(queryParams.limit, 10) || 20;
    const page = parseInt(queryParams.page, 10) || 1;
    const skip = (page - 1) * limit;
    const options = { limit, skip, sort: { createdAt: 'desc' } };
    const { users, total } = await user_repository_1.default.findAllCustomers(filters, options);
    const transformedUsers = users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
    }));
    const details = {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
    };
    return { data: transformedUsers, details, message: 'Clientes retornados com sucesso.' };
};
const getCustomerDetails360 = async (userId) => {
    const user = await user_repository_1.default.findByIdWithRole(userId);
    if (!user || user.role !== 'customer') {
        throw new AppError_1.default('Cliente não encontrado.', 404);
    }
    const addresses = await address_repository_1.default.findAllAddressesByUserIdSummary(userId);
    const ordersSummary = await order_repository_1.default.findSummaryByUserId(userId);
    const responseData = {
        profile: user_transformer_1.default.detailed(user),
        addresses: addresses.map((addr) => ({
            id: addr._id,
            alias: addr.alias,
            street: addr.street,
            city: addr.city,
        })),
        orders: {
            totalCount: ordersSummary.totalCount,
            totalValue: ordersSummary.totalValue,
            lastOrders: ordersSummary.lastOrders,
        },
    };
    return { data: responseData, message: 'Detalhes do cliente retornados com sucesso.' };
};
const forcePasswordResetForUser = async (userId, protocol, host) => {
    const user = await user_repository_1.default.findByIdWithRole(userId);
    if (!user || user.role !== 'customer') {
        throw new AppError_1.default('Cliente não encontrado.', 404);
    }
    await auth_service_1.default.forgotPassword(user.email, protocol, host);
    return {
        data: null,
        message: 'E-mail de redefinição de senha foi enviado para o usuário.',
    };
};
exports.default = {
    listCustomers,
    getCustomerDetails360,
    forcePasswordResetForUser,
};
