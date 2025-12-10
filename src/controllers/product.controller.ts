import { Request, Response, NextFunction } from 'express';
import productService, { IProductService } from '../services/product.service';
import asyncHandler from '../utils/asyncHandler';
import ResponseBuilder from '../utils/responseBuilder';
import { IProductQueryDTO } from '../dtos/product.dto';

export class ProductController {
  constructor(private productService: IProductService) {}

  getAllProducts = asyncHandler(
    async (req: Request<{}, {}, {}, IProductQueryDTO>, res: Response, next: NextFunction) => {
      const result = await this.productService.listPublicProducts(req.query);
      const response = new ResponseBuilder()
        .withStatus('success')
        .withMessage(result.message)
        .withDetails(result.details)
        .withData(result.data)
        .build();

      res.status(200).json(response);
    }
  );

  getOneProduct = asyncHandler(
    async (req: Request<{ productId: string }>, res: Response, next: NextFunction) => {
      const result = await this.productService.getPublicProductDetails(req.params.productId);
      const response = new ResponseBuilder()
        .withStatus('success')
        .withMessage('Detalhes do produto retornados com sucesso.')
        .withData(result.data)
        .withDetails(null)
        .build();
      res.status(200).json(response);
    }
  );
}

export default new ProductController(productService);
