import multer from 'multer';
import { Request } from 'express';
import AppError from '../utils/AppError';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Apenas imagens são permitidas.', 400) as any);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

export default upload;
