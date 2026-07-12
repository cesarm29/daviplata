import { Session } from '../../../core/domain/entities/Session';
import { ISessionRepository } from '../../../core/ports/outbound/ISessionRepository';
import { queryOne, query } from './DatabaseConnection';

export class SessionRepositoryPostgres implements ISessionRepository {
  async create(session: Omit<Session, 'id' | 'createdAt'>): Promise<Session> {
    return queryOne<Session>(
      'INSERT INTO sessions (user_id, session_id, token, expires_at) VALUES ($1, $2, $3, $4) RETURNING id, user_id as "userId", session_id as "sessionId", token, expires_at as "expiresAt", created_at as "createdAt"',
      [session.userId, session.sessionId, session.token, session.expiresAt]
    ) as Promise<Session>;
  }

  async findByToken(token: string): Promise<Session | null> {
    return queryOne<Session>(
      'SELECT id, user_id as "userId", session_id as "sessionId", token, expires_at as "expiresAt", created_at as "createdAt" FROM sessions WHERE token = $1',
      [token]
    );
  }

  async findBySessionId(sessionId: string): Promise<Session | null> {
    return queryOne<Session>(
      'SELECT id, user_id as "userId", session_id as "sessionId", token, expires_at as "expiresAt", created_at as "createdAt" FROM sessions WHERE session_id = $1',
      [sessionId]
    );
  }

  async delete(sessionId: string): Promise<void> {
    await query('DELETE FROM sessions WHERE session_id = $1', [sessionId]);
  }

  async deleteExpired(): Promise<void> {
    await query('DELETE FROM sessions WHERE expires_at < NOW()');
  }
}
