import { User } from '../../../core/domain/entities/User';
import { IUserRepository } from '../../../core/ports/outbound/IUserRepository';
import { queryOne } from './DatabaseConnection';

export class UserRepositoryPostgres implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return queryOne<User>(
      'SELECT id, full_name as "fullName", email, password_hash as "passwordHash", phone, document_id as "documentId", status, created_at as "createdAt" FROM users WHERE email = $1',
      [email]
    );
  }

  async findByPhone(phone: string): Promise<User | null> {
    return queryOne<User>(
      'SELECT id, full_name as "fullName", email, password_hash as "passwordHash", phone, document_id as "documentId", status, created_at as "createdAt" FROM users WHERE phone = $1',
      [phone]
    );
  }

  async findById(id: string): Promise<User | null> {
    return queryOne<User>(
      'SELECT id, full_name as "fullName", email, password_hash as "passwordHash", phone, document_id as "documentId", status, created_at as "createdAt" FROM users WHERE id = $1',
      [id]
    );
  }

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return queryOne<User>(
      'INSERT INTO users (full_name, email, password_hash, phone, document_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name as "fullName", email, password_hash as "passwordHash", phone, document_id as "documentId", status, created_at as "createdAt"',
      [user.fullName, user.email, user.passwordHash, user.phone, user.documentId, user.status]
    ) as Promise<User>;
  }
}
