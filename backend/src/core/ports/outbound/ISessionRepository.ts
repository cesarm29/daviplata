import { Session } from '../domain/entities/Session';

export interface ISessionRepository {
  create(session: Omit<Session, 'id' | 'createdAt'>): Promise<Session>;
  findByToken(token: string): Promise<Session | null>;
  findBySessionId(sessionId: string): Promise<Session | null>;
  delete(sessionId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}
