import { User } from '../domain/entities/User';

export interface IAuthService {
  login(email: string, password: string): Promise<{ sessionId: string; token: string; user: User }>;
  register(data: { fullName: string; email: string; password: string; phone: string; documentId: string }): Promise<{ sessionId: string; token: string; user: User }>;
  validateToken(token: string): Promise<{ userId: string; sessionId: string }>;
  logout(sessionId: string): Promise<void>;
}
