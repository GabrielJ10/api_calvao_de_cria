"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const findByEmailWithPassword = async (email) => {
    return user_model_1.default.findOne({ email: email.toLowerCase() }).select('+passwordHash').select('+role');
};
const findUserByEmail = async (email) => {
    return user_model_1.default.findOne({ email: email.toLowerCase() });
};
const findByPasswordResetToken = async (hashedToken) => {
    return user_model_1.default.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });
};
const findById = async (id) => {
    return user_model_1.default.findById(id);
};
const findByIdWithRole = async (id) => {
    return user_model_1.default.findById(id).select('+role');
};
const createUser = async (userData) => {
    const user = await user_model_1.default.create(userData);
    return user;
};
const findByIdWithPassword = async (id) => {
    return user_model_1.default.findById(id).select('+passwordHash');
};
const findByIdWithRefreshToken = async (id) => {
    return user_model_1.default.findById(id).select('+currentRefreshTokenHash');
};
const updateById = async (userId, updateData) => {
    const updatedUser = await user_model_1.default.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    });
    return updatedUser;
};
const emailExists = async (email) => {
    const user = await user_model_1.default.findOne({ email });
    return !!user;
};
const cpfExists = async (cpf) => {
    const user = await user_model_1.default.findOne({ cpf });
    return !!user;
};
/**
 * [ADMIN] Encontra todos os usuários com role 'customer' com filtros e paginação.
 */
const findAllCustomers = async (filters, options) => {
    const customerFilters = { ...filters, role: 'customer' };
    const query = user_model_1.default.find(customerFilters)
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit);
    const users = await query;
    const total = await user_model_1.default.countDocuments(customerFilters);
    return { users, total };
};
exports.default = {
    findUserByEmail,
    findByEmailWithPassword,
    findById,
    createUser,
    findByIdWithPassword,
    findByIdWithRefreshToken,
    findByIdWithRole,
    findByPasswordResetToken,
    updateById,
    emailExists,
    cpfExists,
    findAllCustomers,
};
