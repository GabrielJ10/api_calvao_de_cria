import { Request, Response, NextFunction } from 'express';
import checkoutService, { ICheckoutService } from '../services/checkout.service';
import asyncHandler from '../utils/asyncHandler';
import ResponseBuilder from '../utils/responseBuilder';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class CheckoutController {
  constructor(private checkoutService: ICheckoutService) {}

  getPaymentMethods = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.checkoutService.getPaymentMethods();
    const response = new ResponseBuilder().withStatus('success').withData(result.data).build();
    res.status(200).json(response);
  });

  previewCoupon = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { couponCode } = req.body;
      const result = await this.checkoutService.previewCoupon(req.user.id, couponCode);
      const response = new ResponseBuilder().withStatus('success').withData(result.data).build();
      res.status(200).json(response);
    }
  );

  createOrder = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const result = await this.checkoutService.createOrder(req.user.id, req.body);
      const response = new ResponseBuilder()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build();
      res.status(201).json(response);
    }
  );
}

export default new CheckoutController(checkoutService);
