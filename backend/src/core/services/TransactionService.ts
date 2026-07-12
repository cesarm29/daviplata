import { ITransactionService } from '../ports/inbound/ITransactionService';
import { ITransactionRepository } from '../ports/outbound/ITransactionRepository';
import { IAccountRepository } from '../ports/outbound/IAccountRepository';
import { IUserRepository } from '../ports/outbound/IUserRepository';
import { AppException } from '../domain/exceptions/AppException';

export class TransactionService implements ITransactionService {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async transfer(userId: string, data: { destinationPhone: string; amount: number; description?: string }) {
    if (data.amount <= 0) {
      throw AppException.badRequest('El monto debe ser mayor a 0');
    }

    if (data.destinationPhone.length !== 10) {
      throw AppException.badRequest('El telefono debe tener 10 digitos');
    }

    const sourceAccount = await this.accountRepository.findByUserId(userId);
    if (!sourceAccount) {
      throw AppException.notFound('Cuenta origen no encontrada');
    }

    if (sourceAccount.balance < data.amount) {
      throw AppException.badRequest('Saldo insuficiente');
    }

    const destinationUser = await this.userRepository.findByPhone(data.destinationPhone);
    if (!destinationUser) {
      throw AppException.notFound('Usuario destino no encontrado');
    }

    if (destinationUser.id === userId) {
      throw AppException.badRequest('No puedes transferir a ti mismo');
    }

    const destinationAccount = await this.accountRepository.findByUserId(destinationUser.id);
    if (!destinationAccount) {
      throw AppException.notFound('Cuenta destino no encontrada');
    }

    const debitTransaction = await this.transactionRepository.create({
      userId,
      sourceAccountId: sourceAccount.id,
      destinationPhone: data.destinationPhone,
      amount: data.amount,
      type: 'DEBIT',
      description: data.description || null,
      status: 'COMPLETED',
    });

    await this.transactionRepository.create({
      userId: destinationUser.id,
      sourceAccountId: destinationAccount.id,
      destinationPhone: data.destinationPhone,
      amount: data.amount,
      type: 'CREDIT',
      description: data.description || null,
      status: 'COMPLETED',
    });

    await this.accountRepository.updateBalance(sourceAccount.id, sourceAccount.balance - data.amount);
    await this.accountRepository.updateBalance(destinationAccount.id, destinationAccount.balance + data.amount);

    return debitTransaction;
  }

  async getMovements(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const { transactions, total } = await this.transactionRepository.findByUserId(userId, limit, offset);
    return { transactions, total, page };
  }
}
