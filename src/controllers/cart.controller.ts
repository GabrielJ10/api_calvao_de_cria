import { Request, Response, NextFunction } from 'express';
import cartService, { ICartService, CartIdentifier } from '../services/cart.service';
import asyncHandler from '../utils/asyncHandler';
import ResponseBuilder from '../utils/responseBuilder';

export class CartController {
  constructor(private cartService: ICartService) {}

  getCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { data } = await this.cartService.getCart(req.cartIdentifier!);
    const response = new ResponseBuilder().withData(data).build();
    res.status(200).json(response);
  });

  addItemToCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { data, newGuestCartId, details } = await this.cartService.addItemToCart(
      req.cartIdentifier!,
      req.body
    );

    const responseBuilder = new ResponseBuilder().withData(data);

    if (newGuestCartId) {
      // Retorna no header e no body, conforme solicitado
      res.setHeader('X-Guest-Cart-Id-Created', newGuestCartId);
      responseBuilder.withExtra('guestCartId', newGuestCartId);
    }
    if (details) {
      responseBuilder.withDetails(details);
    }

    res.status(200).json(responseBuilder.build());
  });

  updateItemQuantity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const { data, details } = await this.cartService.updateItemQuantity(
      req.cartIdentifier!,
      productId,
      quantity
    );

    const responseBuilder = new ResponseBuilder().withData(data);
    if (details) {
      responseBuilder.withDetails(details);
    }

    res.status(200).json(responseBuilder.build());
  });

  removeItemFromCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const { data, details } = await this.cartService.removeItemFromCart(
      req.cartIdentifier!,
      productId
    );

    const responseBuilder = new ResponseBuilder().withData(data);
    if (details) {
      responseBuilder.withDetails(details);
    }

    res.status(200).json(responseBuilder.build());
  });

  mergeCarts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { guestCartId } = req.body;
    const { data } = await this.cartService.mergeCarts(req.user!.id, guestCartId);
    res.status(200).json(new ResponseBuilder().withData(data).build());
  });

  applyCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { couponCode } = req.body;
    const { data } = await this.cartService.applyCoupon(req.cartIdentifier!, couponCode);
    res
      .status(200)
      .json(
        new ResponseBuilder().withData(data).withMessage('Cupom aplicado com sucesso.').build()
      );
  });

  removeCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { data } = await this.cartService.removeCoupon(req.cartIdentifier!);
    res
      .status(200)
      .json(
        new ResponseBuilder().withData(data).withMessage('Cupom removido com sucesso.').build()
      );
  });
}

export default new CartController(cartService);
