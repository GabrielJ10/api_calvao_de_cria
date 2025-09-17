const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');

/**
 * Cria um pedido, abate o estoque e limpa o carrinho de forma transacional.
 * @param {object} orderData - Os dados completos do pedido a ser criado.
 * @returns {Promise<Document>} O documento do pedido recém-criado.
 */
const createOrderTransactional = async (orderData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Criar o pedido
    const newOrder = new Order(orderData);
    await newOrder.save({ session });

    // 2. Abater o estoque de cada produto
    for (const item of newOrder.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: -item.quantity } },
        { session }
      );
    }
    
    // 3. Deletar o carrinho antigo
    await Cart.deleteOne({ userId: orderData.userId }).session(session);

    // 4. Criar um novo carrinho vazio
    await Cart.create([{ userId: orderData.userId }], { session });


    await session.commitTransaction();
    return newOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error; // Propaga o erro para o service tratar
  } finally {
    session.endSession();
  }
};

module.exports = {
  createOrderTransactional,
};