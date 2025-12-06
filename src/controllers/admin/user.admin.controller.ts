import { Request, Response, NextFunction } from 'express';
import adminUserService, { IUserAdminService } from '../../services/admin/user.admin.service';
import asyncHandler from '../../utils/asyncHandler';
import ResponseBuilder from '../../utils/responseBuilder';

export class UserAdminController {
  constructor(private adminUserService: IUserAdminService) {}

  listCustomers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.adminUserService.listCustomers(req.query);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage(result.message)
      .withPagination(result.details)
      .withData(result.data)
      .build();
    res.status(200).json(response);
  });

  getCustomerDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const result = await this.adminUserService.getCustomerDetails360(userId);
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage(result.message)
      .withData(result.data)
      .build();
    res.status(200).json(response);
  });

  forcePasswordReset = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const result = await this.adminUserService.forcePasswordResetForUser(
      userId,
      req.protocol,
      req.get('host')!
    );
    const response = new ResponseBuilder()
      .withStatus('success')
      .withMessage(result.message)
      .build();
    res.status(200).json(response);
  });
}

export default new UserAdminController(adminUserService);
