import { Request, Response } from 'express';
import { IAuthService } from '../../../core/ports/inbound/IAuthService';
import { AppException } from '../../../core/domain/exceptions/AppException';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw AppException.badRequest('Correo y contrasena son requeridos');
      }

      const result = await this.authService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ message: error.message, code: error.code || 'ERROR' });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const { fullName, email, password, phone, documentId } = req.body;
      if (!fullName || !email || !password || !phone || !documentId) {
        throw AppException.badRequest('Todos los campos son requeridos');
      }

      const result = await this.authService.register({ fullName, email, password, phone, documentId });
      res.status(201).json(result);
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ message: error.message, code: error.code || 'ERROR' });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const sessionId = (req as any).sessionId;
      await this.authService.logout(sessionId);
      res.status(200).json({ message: 'Sesion cerrada' });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ message: error.message, code: error.code || 'ERROR' });
    }
  };
}
