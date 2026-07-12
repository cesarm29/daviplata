import { Request, Response } from 'express';
import { IAccountService } from '../../../core/ports/inbound/IAccountService';
import { AppException } from '../../../core/domain/exceptions/AppException';

export class AccountController {
  constructor(private readonly accountService: IAccountService) {}

  getBalance = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        throw AppException.unauthorized();
      }

      const account = await this.accountService.getBalance(userId);
      res.status(200).json({ balance: account.balance, accountNumber: account.accountNumber, currency: account.currency });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ message: error.message, code: error.code || 'ERROR' });
    }
  };

  getByUser = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        throw AppException.unauthorized();
      }

      const account = await this.accountService.getByUser(userId);
      res.status(200).json(account);
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ message: error.message, code: error.code || 'ERROR' });
    }
  };
}
