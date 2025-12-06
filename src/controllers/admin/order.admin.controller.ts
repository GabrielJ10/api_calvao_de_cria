import { Request, Response, NextFunction } from 'express';
import adminOrderService, { IOrderAdminService } from '../../services/admin/order.admin.service';
import asyncHandler from '../../utils/asyncHandler';
import ResponseBuilder from '../../utils/responseBuilder';

export class OrderAdminController {
  constructor(private adminOrderService: IOrderAdminService) {}

  listOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.adminOrderService.listAllOrders(req.query);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage(result.message)
      .withPagination(result.details)
      .withData(result.data)
      .build();
    res.status(200).json(response);
  });

  getOrderDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const result = await this.adminOrderService.getOrderDetails(orderId);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage(result.message)
      .withData(result.data)
      .build();
    res.status(200).json(response);
  });

  updateOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const result = await this.adminOrderService.updateOrder(orderId, req.body);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage(result.message)
      .withData(result.data)
      .build();
    res.status(200).json(response);
  });
}

export default new OrderAdminController(adminOrderService);
