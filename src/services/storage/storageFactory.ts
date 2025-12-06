import cloudinaryStorage from './cloudinaryStorage';
import { IStorageProvider } from './storage.interface';

const PROVIDER = process.env.STORAGE_PROVIDER || 'cloudinary';

function getStorageProvider(): IStorageProvider {
  switch (PROVIDER) {
    case 'cloudinary':
      return cloudinaryStorage;
    default:
      throw new Error(`Provedor de storage desconhecido: ${PROVIDER}`);
  }
}

export default getStorageProvider();
