import { IAccountService } from '../ports/inbound/IAccountService';
import { IAccountRepository } from '../ports/outbound/IAccountRepository';
import { AppException } from '../domain/exceptions/AppException';

export class AccountService implements IAccountService {
  constructor(private readonly accountRepository: IAccountRepository) {}

  async getBalance(userId: string) {
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) {
      throw AppException.notFound('Cuenta no encontrada');
    }
    return account;
  }

  async getByUser(userId: string) {
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) {
      throw AppException.notFound('Cuenta no encontrada');
    }
    return account;
  }
}
