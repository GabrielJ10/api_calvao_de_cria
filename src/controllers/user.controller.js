const userService = require('../services/user.service');
const addressService = require('../services/address.service');
const orderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');
const ResponseBuilder = require('../utils/responseBuilder');

const getMyProfile = asyncHandler(async (req, res, next) => {
  const result = await userService.getUserProfile(req.user.id);
  const response = new ResponseBuilder()
    .withStatus('success')
    .withMessage(result.message)
    .withData(result.user)
    .withDetails(result.details)
    .build();

  res.status(200).json(response);
});

const updateMyProfile = asyncHandler(async (req, res, next) => {
  const result = await userService.updateUserProfile(req.user.id, req.body);
  const response = new ResponseBuilder()
    .withStatus('success')
    .withMessage(result.message)
    .withData(result.data)
    .withDetails(result.details)
    .build();

  res.status(200).json(response);
});

const changeMyPassword = asyncHandler(async (req, res, next) => {
  const result = await userService.changePassword(req.user.id, req.body.password);
  const response = new ResponseBuilder()
    .withStatus('success')
    .withMessage(result.message)
    .withData(result.data)
    .withDetails(result.details)
    .build();

  res.status(200).json(response);
});

const listMyAddresses = asyncHandler(async (req, res, next) => {
  const result = await addressService.listAddressesSummary(req.user.id);
  const response = new ResponseBuilder()
    .withStatus('success')
    .withMessage(result.message)
    .withExtra('totalItems', result.details.totalItens)
    .withData(result.data)
    .build();

  res.status(200).json(response);
});

const getMyAddressDetails = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  const result = await addressService.getAddressDetails(addressId, req.user.id);
  const response = new ResponseBuilder()
    .withStatus('success')
    .withMessage(result.message)
    .withData(result.data)
    .withDetails(result.details)
    .build();

  res.status(200).json(response);
});

const addMyAddress = asyncHandler(async (req, res, next) => {
  const result = await addressService.addAddress(req.user.id, req.body);
  const response = new ResponseBuilder()
    .withStatus('success')
    .withMessage(result.message)
    .withData(result.data)
    .withDetails(result.details)
    .build();

  res.status(201).json(response);
});

const updateMyAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  const result = await addressService.updateAddress(addressId, req.user.id, req.body);
  const response = new ResponseBuilder()
    .withStatus('success')
    .withMessage(result.message)
    .withData(result.data)
    .withDetails(result.details)
    .build();

  res.status(200).json(response);
});

const deleteMyAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  const result = await addressService.removeAddress(addressId, req.user.id);
  const response = new ResponseBuilder()
    .withStatus('success')
    .withMessage(result.message)
    .withData(result.data)
    .withDetails(result.details)
    .build();

  res.status(200).json(response);
});
const listMyOrders = asyncHandler(async (req, res, next) => {
  const result = await orderService.listUserOrders(req.user.id, req.query);
  const response = new ResponseBuilder()
    .withStatus('success')
    .withMessage(result.message)
    .withPagination(result.details)
    .withData(result.data)
    .build();
  res.status(200).json(response);
});

const getMyOrderDetails = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const result = await orderService.getUserOrderDetails(req.user.id, orderId);
  const response = new ResponseBuilder()
    .withStatus('success')
    .withMessage(result.message)
    .withData(result.data)
    .build();
  res.status(200).json(response);
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  listMyAddresses,
  getMyAddressDetails,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
  listMyOrders,
  getMyOrderDetails,
};
