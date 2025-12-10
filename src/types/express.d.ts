import { IUser } from '../models/user.model';

/**
 * Authenticated user object set by auth middleware
 */
export interface AuthenticatedUser {
  id: string;
  role: 'admin' | 'customer';
}

/**
 * Multer file object for multipart/form-data uploads
 */
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface CartIdentifier {
  userId?: string;
  guestCartId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      cartIdentifier?: CartIdentifier;
      files?: MulterFile[];
    }
  }
}
