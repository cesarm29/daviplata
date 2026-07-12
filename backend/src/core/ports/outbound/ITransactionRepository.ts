import { Transaction } from '../domain/entities/Transaction';

export interface ITransactionRepository {
  create(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
  findByUserId(userId: string, page: number, limit: number): Promise<{ transactions: Transaction[]; total: number }>;
  findById(id: string): Promise<Transaction | null>;
}
