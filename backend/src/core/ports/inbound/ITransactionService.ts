import { Transaction } from '../domain/entities/Transaction';

export interface ITransactionService {
  transfer(userId: string, data: { destinationPhone: string; amount: number; description?: string }): Promise<Transaction>;
  getMovements(userId: string, page: number, limit: number): Promise<{ transactions: Transaction[]; total: number; page: number }>;
}
