const Cart = require('../models/cart.model');

const findByUserId = async (userId) => {
  return Cart.findOne({ userId });
};

const findByGuestCartId = async (guestCartId) => {
  return Cart.findOne({ guestCartId });
};

const create = async (cartData) => {
  return Cart.create(cartData);
};

const findByIdentifier = async ({ userId, guestCartId }) => {
  if (userId) {
    return Cart.findOne({ userId });
  }
  if (guestCartId) {
    return Cart.findOne({ guestCartId });
  }
  return null;
};

const updateById = async (cartId, updateData) => {
  return Cart.findByIdAndUpdate(cartId, updateData, { new: true });
};

const deleteByGuestCartId = async (guestCartId) => {
    return Cart.findOneAndDelete({ guestCartId });
}

module.exports = {
  findByUserId,
  findByGuestCartId,
  create,
  findByIdentifier,
  updateById,
  deleteByGuestCartId
};