const userService = require('../services/user.service');
const addressService = require('../services/address.service');
const asyncHandler = require('../utils/asyncHandler');

const getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await userService.getUserProfile(req.user.id);
  res.status(200).json({ status: 'success', data: user });
});

const updateMyProfile = asyncHandler(async (req, res, next) => {
  const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
  res.status(200).json({ status: 'success', data: updatedUser });
});

const changeMyPassword = asyncHandler(async (req, res, next) => {
  await userService.changePassword(req.user.id, req.body.password);
  res.status(200).json({ status: 'success', message: 'Senha alterada com sucesso!' });
});

const listMyAddresses = asyncHandler(async (req, res, next) => {
  const addresses = await addressService.listAddressesSummary(req.user.id);
  res.status(200).json({ status: 'success', quantity: addresses.length, data: addresses });
});

const getMyAddressDetails = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  const address = await addressService.getAddressDetails(addressId, req.user.id);
  res.status(200).json({ status: 'success', data: address });
});

const addMyAddress = asyncHandler(async (req, res, next) => {
  const newAddress = await addressService.addAddress(req.user.id, req.body);
  res.status(201).json({ status: 'success', data: newAddress });
});

const updateMyAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  const updatedAddress = await addressService.updateAddress(addressId, req.user.id, req.body);
  res.status(200).json({ status: 'success', data: updatedAddress });
});

const deleteMyAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  await addressService.removeAddress(addressId, req.user.id);
  res.status(204).send();
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
};
