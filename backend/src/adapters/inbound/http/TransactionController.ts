import { Request, Response } from 'express';
import { ITransactionService } from '../../core/ports/inbound/ITransactionService';
import { AppException } from '../../core/domain/exceptions/AppException';

export class TransactionController {
  constructor(private readonly transactionService: ITransactionService) {}

  transfer = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        throw AppException.unauthorized();
      }

      const { destinationPhone, amount, description } = req.body;
      if (!destinationPhone || !amount) {
        throw AppException.badRequest('Telefono destino y monto son requeridos');
      }

      const transaction = await this.transactionService.transfer(userId, {
        destinationPhone,
        amount: parseFloat(amount),
        description,
      });

      res.status(201).json({ transaction });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ message: error.message, code: error.code || 'ERROR' });
    }
  };

  getMovements = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        throw AppException.unauthorized();
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.transactionService.getMovements(userId, page, limit);
      res.status(200).json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ message: error.message, code: error.code || 'ERROR' });
    }
  };
}
