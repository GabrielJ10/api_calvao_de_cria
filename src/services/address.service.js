const addressRepository = require('../repositories/address.repository');
const AppError = require('../utils/AppError');

const addAddress = async (userId, addressData) => {
  const dataToSave = { ...addressData, userId };
  return addressRepository.createAddress(dataToSave);
};

const listAddressesSummary = async (userId) => {
  return addressRepository.findAllAddressesByUserIdSummary(userId);
};

const getAddressDetails = async (addressId, userId) => {
  const address = await addressRepository.findAddressByIdAndUserIdDetail(addressId, userId);
  if (!address) {
    throw new AppError('Endereço não encontrado ou não pertence a este usuário.', 404);
  }
  return address;
};

const updateAddress = async (addressId, userId, updateData) => {
  const updatedAddress = await addressRepository.updateAddress(addressId, userId, updateData);
  if (!updatedAddress) {
    throw new AppError('Endereço não encontrado ou não pertence a este usuário.', 404);
  }
  return updatedAddress;
};

const removeAddress = async (addressId, userId) => {
  const deletedAddress = await addressRepository.deleteAddress(addressId, userId);
  if (!deletedAddress) {
    throw new AppError('Endereço não encontrado ou não pertence a este usuário.', 404);
  }
};

module.exports = {
  addAddress,
  listAddressesSummary,
  getAddressDetails,
  updateAddress,
  removeAddress,
};
