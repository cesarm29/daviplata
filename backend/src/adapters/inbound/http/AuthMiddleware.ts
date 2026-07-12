import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../../../core/ports/inbound/IAuthService';
import { AppException } from '../../../core/domain/exceptions/AppException';

export class AuthMiddleware {
  constructor(private readonly authService: IAuthService) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw AppException.unauthorized('Token requerido');
      }

      const token = authHeader.split(' ')[1];
      const { userId, sessionId } = await this.authService.validateToken(token);

      (req as any).userId = userId;
      (req as any).sessionId = sessionId;

      next();
    } catch (error: any) {
      if (error instanceof AppException) {
        res.status(error.statusCode).json({ message: error.message, code: error.code });
      } else {
        res.status(401).json({ message: 'No autorizado', code: 'UNAUTHORIZED' });
      }
    }
  };
}
