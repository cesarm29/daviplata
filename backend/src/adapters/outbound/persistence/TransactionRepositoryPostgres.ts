import { Transaction } from '../../../core/domain/entities/Transaction';
import { ITransactionRepository } from '../../../core/ports/outbound/ITransactionRepository';
import { queryOne, query } from './DatabaseConnection';

export class TransactionRepositoryPostgres implements ITransactionRepository {
  async create(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    return queryOne<Transaction>(
      'INSERT INTO transactions (user_id, source_account_id, destination_phone, amount, type, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, user_id as "userId", source_account_id as "sourceAccountId", destination_phone as "destinationPhone", amount, type, description, status, created_at as "createdAt"',
      [transaction.userId, transaction.sourceAccountId, transaction.destinationPhone, transaction.amount, transaction.type, transaction.description, transaction.status]
    ) as Promise<Transaction>;
  }

  async findByUserId(userId: string, limit: number, offset: number): Promise<{ transactions: Transaction[]; total: number }> {
    const transactions = await query<Transaction>(
      'SELECT id, user_id as "userId", source_account_id as "sourceAccountId", destination_phone as "destinationPhone", amount, type, description, status, created_at as "createdAt" FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );

    const countResult = await query<{ count: string }>('SELECT COUNT(*) as count FROM transactions WHERE user_id = $1', [userId]);
    const total = parseInt(countResult[0]?.count || '0');

    return { transactions, total };
  }

  async findById(id: string): Promise<Transaction | null> {
    return queryOne<Transaction>(
      'SELECT id, user_id as "userId", source_account_id as "sourceAccountId", destination_phone as "destinationPhone", amount, type, description, status, created_at as "createdAt" FROM transactions WHERE id = $1',
      [id]
    );
  }
}
