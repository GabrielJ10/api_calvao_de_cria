import Address, { IAddress } from '../models/address.model';

export interface IAddressRepository {
  createAddress(addressData: Partial<IAddress>): Promise<IAddress>;
  findAllAddressesByUserIdSummary(userId: string): Promise<IAddress[]>;
  findAddressByIdAndUserIdDetail(addressId: string, userId: string): Promise<IAddress | null>;
  updateAddress(
    addressId: string,
    userId: string,
    updateData: Partial<IAddress>
  ): Promise<IAddress | null>;
  deleteAddress(addressId: string, userId: string): Promise<IAddress | null>;
}

export class AddressRepository implements IAddressRepository {
  async createAddress(addressData: Partial<IAddress>): Promise<IAddress> {
    return Address.create(addressData);
  }

  // Retorna apenas os campos necessários para a listagem
  async findAllAddressesByUserIdSummary(userId: string): Promise<IAddress[]> {
    return Address.find({ userId });
    // .select('alias street number city neighborhood');
  }

  // Retorna todos os campos de um endereço específico
  async findAddressByIdAndUserIdDetail(
    addressId: string,
    userId: string
  ): Promise<IAddress | null> {
    return Address.findOne({ _id: addressId, userId });
  }

  async updateAddress(
    addressId: string,
    userId: string,
    updateData: Partial<IAddress>
  ): Promise<IAddress | null> {
    return Address.findOneAndUpdate({ _id: addressId, userId }, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteAddress(addressId: string, userId: string): Promise<IAddress | null> {
    return Address.findOneAndDelete({ _id: addressId, userId });
  }
}

// Export default instance for backward compatibility during refactor
export default new AddressRepository();
