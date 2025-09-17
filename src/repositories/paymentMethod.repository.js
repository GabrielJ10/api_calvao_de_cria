const PaymentMethod = require('../models/paymentMethod.model');

/**
 * Retorna todos os métodos de pagamento ativos para os clientes.
 */
const findAllEnabled = async () => {
  return PaymentMethod.find({ isEnabled: true }).sort({ name: 1 });
};

/**
 * Retorna todos os métodos de pagamento para o painel de admin.
 */
const findAll = async () => {
    return PaymentMethod.find().sort({ name: 1 });
};

module.exports = {
  findAllEnabled,
  findAll,
};