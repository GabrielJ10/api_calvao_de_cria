"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_repository_1 = __importDefault(require("../repositories/user.repository"));
const cart_repository_1 = __importDefault(require("../repositories/cart.repository"));
const user_transformer_1 = __importDefault(require("../utils/transformers/user.transformer"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const email_1 = __importDefault(require("../utils/email")); //MOCK
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
const register = async (userData) => {
    const { password, role, ...restUserData } = userData;
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const userId = new mongoose_1.default.Types.ObjectId(); // Explicitly create ID to use in both user and cart
    // We need to construct the user object correctly with the ID we generated
    // However, Repository createUser takes Partial<IUser>.
    // Let's create the user normally but we can't inject ID easily with mongoose create unless we use new User().
    // Actually, we can pass _id in create.
    const tempUser = { _id: userId, role: 'customer' }; // Minimal object for token generation
    const { accessToken, refreshToken } = generateTokens(tempUser);
    const refreshTokenHash = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
    const dataToSave = {
        ...restUserData,
        _id: userId,
        passwordHash,
        currentRefreshTokenHash: refreshTokenHash,
    };
    const newUser = await user_repository_1.default.createUser(dataToSave);
    await cart_repository_1.default.create({ userId: newUser.id }); // Use id (string) or _id (ObjectId)
    // newUser is a Document.
    const newUserObj = newUser.toObject ? newUser.toObject() : newUser;
    // Note: userTransformer expects IUser. toObject returns plain object. Use newUser directly if compatible or cast.
    // userTransformer uses typical property access, so it should be fine.
    return {
        data: user_transformer_1.default.loginOrRegister(newUser, { accessToken, refreshToken }),
        message: null,
        details: null,
    };
};
const login = async (email, password) => {
    const user = await user_repository_1.default.findByEmailWithPassword(email);
    const isPasswordValid = user ? await bcryptjs_1.default.compare(password, user.passwordHash) : false;
    if (!user || !isPasswordValid) {
        throw new AppError_1.default('Credenciais inválidas.', 401);
    }
    const { accessToken, refreshToken } = generateTokens(user);
    const refreshTokenHash = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
    await user_repository_1.default.updateById(user.id, { currentRefreshTokenHash: refreshTokenHash });
    return {
        data: user_transformer_1.default.loginOrRegister(user, { accessToken, refreshToken }),
        message: null,
        details: null,
    };
};
const logout = async (userId) => {
    const user = await user_repository_1.default.findById(userId);
    if (user) {
        await user_repository_1.default.updateById(userId, { currentRefreshTokenHash: '' }); // Or null, but types might imply string. model says string (optional).
    }
    return {
        data: null,
        message: 'Logout realizado com sucesso.',
        details: null,
    };
};
const refreshAccessToken = async (token) => {
    const decoded = jsonwebtoken_1.default.decode(token);
    if (!decoded || !decoded.userId) {
        throw new AppError_1.default('Refresh token inválido.', 401);
    }
    const user = await user_repository_1.default.findByIdWithRefreshToken(decoded.userId);
    const receivedTokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
    // Valida se o token recebido corresponde ao armazenado no banco
    if (!user ||
        !user.currentRefreshTokenHash ||
        user.currentRefreshTokenHash !== receivedTokenHash) {
        throw new AppError_1.default('Sua sessão é inválida ou expirou. Por favor, faça login novamente.', 401);
    }
    // Verifica a assinatura e expiração do refresh token
    jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    return {
        data: { accessToken, refreshToken: token },
        message: null,
        details: null,
    };
};
const forgotPassword = async (email, protocol, host) => {
    const user = await user_repository_1.default.findUserByEmail(email);
    if (!user) {
        return;
    }
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const hashedToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000);
    await user_repository_1.default.updateById(user.id, {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expirationDate,
    });
    try {
        const resetURL = `${protocol}://${host}/api/v1/auth/reset-password/${resetToken}`;
        // Assuming simple User object for Email util
        const simpleUserForEmail = { email: user.email, name: user.name };
        await new email_1.default(simpleUserForEmail, resetURL).sendPasswordReset();
    }
    catch (err) {
        await user_repository_1.default.updateById(user.id, {
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        });
        throw new AppError_1.default('Houve um erro ao enviar o e-mail. Por favor, tente novamente mais tarde.', 500);
    }
    return {
        data: process.env.NODE_ENV === 'development' ? { resetToken } : null,
        message: 'Se uma conta com este e-mail existir, um link de recuperação foi enviado.',
        details: null,
    };
};
const resetPassword = async (token, newPassword) => {
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const user = await user_repository_1.default.findByPasswordResetToken(hashedToken);
    if (!user) {
        throw new AppError_1.default('Token inválido ou expirado.', 400);
    }
    const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
    const updatePayload = {
        $set: {
            passwordHash,
            currentRefreshTokenHash: null,
        },
        $unset: {
            resetPasswordToken: '',
            resetPasswordExpires: '',
        },
    };
    await user_repository_1.default.updateById(user.id, updatePayload);
    return {
        data: null,
        message: 'Senha redefinida com sucesso!',
        details: null,
    };
};
exports.default = {
    register,
    login,
    logout,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
};
