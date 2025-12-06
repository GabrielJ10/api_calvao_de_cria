import { IUser } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Should be IUser ideally, but auth middleware sets a partial object { id, role } sometimes.
      cartIdentifier?: {
        userId?: string;
        guestCartId?: string;
      };
    }
  }
}
