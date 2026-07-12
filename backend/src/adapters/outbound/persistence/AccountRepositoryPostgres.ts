import { Account } from '../../../core/domain/entities/Account';
import { IAccountRepository } from '../../../core/ports/outbound/IAccountRepository';
import { queryOne, query } from './DatabaseConnection';

export class AccountRepositoryPostgres implements IAccountRepository {
  async findByUserId(userId: string): Promise<Account | null> {
    return queryOne<Account>(
      'SELECT id, user_id as "userId", account_number as "accountNumber", balance, currency, created_at as "createdAt", updated_at as "updatedAt" FROM accounts WHERE user_id = $1',
      [userId]
    );
  }

  async updateBalance(accountId: string, newBalance: number): Promise<void> {
    await query('UPDATE accounts SET balance = $1, updated_at = NOW() WHERE id = $2', [newBalance, accountId]);
  }

  async create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    return queryOne<Account>(
      'INSERT INTO accounts (user_id, account_number, balance, currency) VALUES ($1, $2, $3, $4) RETURNING id, user_id as "userId", account_number as "accountNumber", balance, currency, created_at as "createdAt", updated_at as "updatedAt"',
      [account.userId, account.accountNumber, account.balance, account.currency]
    ) as Promise<Account>;
  }
}
