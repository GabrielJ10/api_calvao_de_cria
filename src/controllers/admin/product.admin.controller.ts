import { Request, Response, NextFunction } from 'express';
import adminProductService, {
  IProductAdminService,
} from '../../services/admin/product.admin.service';
import asyncHandler from '../../utils/asyncHandler';
import ResponseBuilder from '../../utils/responseBuilder';

export class ProductAdminController {
  constructor(private adminProductService: IProductAdminService) {}

  createNewProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const files = (req as any).files;
    const result = await this.adminProductService.createProduct(req.body, files);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withDetails(result.details)
      .withMessage(result.message)
      .withData(result.data)
      .build();

    res.status(201).json(response);
  });

  getAllProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.adminProductService.listProducts(req.query);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage(result.message)
      .withDetails(result.details)
      .withData(result.data)
      .build();

    res.status(200).json(response);
  });

  getOneProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.adminProductService.productDetails(req.params.productId);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage(result.message)
      .withData(result.data)
      .withDetails(null)
      .build();
    res.status(200).json(response);
  });

  updateExistingProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const result = await this.adminProductService.updateProduct(productId, req.body);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage(result.message)
      .withData(result.data)
      .withDetails(result.details)
      .build();

    res.status(200).json(response);
  });

  deleteExistingProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const result = await this.adminProductService.deleteProduct(productId);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage('Produto deletado com sucesso.')
      .withData(result.data)
      .withDetails(result.details)
      .build();

    res.status(204).json(response);
  });

  addProductImages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const files = (req as any).files;
    const result = await this.adminProductService.addProductImages(productId, req.body, files);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage(result.message)
      .withData(result.data)
      .build();

    res.status(201).json(response);
  });

  updateProductImages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const result = await this.adminProductService.updateProductImages(productId, req.body);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage(result.message)
      .withData(result.data)
      .build();

    res.status(200).json(response);
  });

  deleteProductImages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const result = await this.adminProductService.deleteProductImages(productId, req.body);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage('Imagens deletadas com sucesso.')
      .withData(result.data)
      .build();

    res.status(200).json(response);
  });
}

export default new ProductAdminController(adminProductService);
