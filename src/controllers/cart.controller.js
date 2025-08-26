const cartService = require('../services/cart.service');
const asyncHandler = require('../utils/asyncHandler');
const ResponseBuilder = require('../utils/responseBuilder');

const getCart = asyncHandler(async (req, res, next) => {
  const result = await cartService.getCart(req.cartIdentifier);
  res.status(200).json(new ResponseBuilder().withData(result.data).build());
});

const addItemToCart = asyncHandler(async (req, res, next) => {
  const result = await cartService.addItemToCart(req.cartIdentifier, req.body);

  if (result.newGuestCartId) {
    res.setHeader('X-Guest-Cart-Id-Created', result.newGuestCartId);
  }

  res.status(200).json(new ResponseBuilder().withData(result.data).build());
});

const updateItemQuantity = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const result = await cartService.updateItemQuantity(req.cartIdentifier, productId, quantity);
    res.status(200).json(new ResponseBuilder().withData(result.data).build());
});
  
const removeItemFromCart = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const result = await cartService.removeItemFromCart(req.cartIdentifier, productId);
    res.status(200).json(new ResponseBuilder().withData(result.data).build());
});

const mergeCarts = asyncHandler(async (req, res, next) => {
    const { guestCartId } = req.body;
    const result = await cartService.mergeCarts(req.user.id, guestCartId);
    res.status(200).json(new ResponseBuilder().withData(result.data).build());
});

module.exports = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  mergeCarts
};