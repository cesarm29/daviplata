import { Account } from '../domain/entities/Account';

export interface IAccountService {
  getBalance(userId: string): Promise<Account>;
  getByUser(userId: string): Promise<Account>;
}
