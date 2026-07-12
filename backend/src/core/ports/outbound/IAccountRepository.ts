import { Account } from '../domain/entities/Account';

export interface IAccountRepository {
  findByUserId(userId: string): Promise<Account | null>;
  updateBalance(accountId: string, newBalance: number): Promise<void>;
  create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account>;
}
