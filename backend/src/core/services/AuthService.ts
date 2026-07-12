import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { IAuthService } from '../ports/inbound/IAuthService';
import { IUserRepository } from '../ports/outbound/IUserRepository';
import { IAccountRepository } from '../ports/outbound/IAccountRepository';
import { ISessionRepository } from '../ports/outbound/ISessionRepository';
import { AppException } from '../domain/exceptions/AppException';

export class AuthService implements IAuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN = '24h';

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly sessionRepository: ISessionRepository
  ) {
    this.JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw AppException.badRequest('Correo o contrasena incorrectos');
    }

    if (user.status !== 'ACTIVE') {
      throw AppException.forbidden('Cuenta desactivada');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw AppException.badRequest('Correo o contrasena incorrectos');
    }

    const token = jwt.sign({ userId: user.id }, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.sessionRepository.create({
      userId: user.id,
      sessionId,
      token,
      expiresAt,
    });

    return { sessionId, token, user };
  }

  async register(data: { fullName: string; email: string; password: string; phone: string; documentId: string }) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw AppException.conflict('El correo ya esta registrado');
    }

    const existingPhone = await this.userRepository.findByPhone(data.phone);
    if (existingPhone) {
      throw AppException.conflict('El telefono ya esta registrado');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.userRepository.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      phone: data.phone,
      documentId: data.documentId,
      status: 'ACTIVE',
    });

    const accountNumber = `${Date.now()}${Math.floor(Math.random() * 10000)}`.slice(0, 12);
    await this.accountRepository.create({
      userId: user.id,
      accountNumber,
      balance: 0,
      currency: 'COP',
    });

    const token = jwt.sign({ userId: user.id }, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.sessionRepository.create({
      userId: user.id,
      sessionId,
      token,
      expiresAt,
    });

    return { sessionId, token, user };
  }

  async validateToken(token: string) {
    const session = await this.sessionRepository.findByToken(token);
    if (!session) {
      throw AppException.unauthorized('Sesion invalida');
    }

    if (new Date() > session.expiresAt) {
      throw AppException.unauthorized('Sesion expirada');
    }

    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      return { userId: decoded.userId, sessionId: session.sessionId };
    } catch {
      throw AppException.unauthorized('Token invalido');
    }
  }

  async logout(sessionId: string) {
    await this.sessionRepository.delete(sessionId);
  }
}
