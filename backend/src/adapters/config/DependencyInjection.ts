import { UserRepositoryPostgres } from '../outbound/persistence/UserRepositoryPostgres';
import { AccountRepositoryPostgres } from '../outbound/persistence/AccountRepositoryPostgres';
import { TransactionRepositoryPostgres } from '../outbound/persistence/TransactionRepositoryPostgres';
import { SessionRepositoryPostgres } from '../outbound/persistence/SessionRepositoryPostgres';
import { AuthService } from '../../core/services/AuthService';
import { AccountService } from '../../core/services/AccountService';
import { TransactionService } from '../../core/services/TransactionService';
import { AuthMiddleware } from '../inbound/http/AuthMiddleware';
import { AuthController } from '../inbound/http/AuthController';
import { AccountController } from '../inbound/http/AccountController';
import { TransactionController } from '../inbound/http/TransactionController';

export interface Container {
  authService: AuthService;
  accountService: AccountService;
  transactionService: TransactionService;
  authMiddleware: AuthMiddleware;
  authController: AuthController;
  accountController: AccountController;
  transactionController: TransactionController;
}

export function createContainer(): Container {
  const userRepository = new UserRepositoryPostgres();
  const accountRepository = new AccountRepositoryPostgres();
  const transactionRepository = new TransactionRepositoryPostgres();
  const sessionRepository = new SessionRepositoryPostgres();

  const authService = new AuthService(userRepository, accountRepository, sessionRepository);
  const accountService = new AccountService(accountRepository);
  const transactionService = new TransactionService(transactionRepository, accountRepository, userRepository);

  const authMiddleware = new AuthMiddleware(authService);
  const authController = new AuthController(authService);
  const accountController = new AccountController(accountService);
  const transactionController = new TransactionController(transactionService);

  return {
    authService,
    accountService,
    transactionService,
    authMiddleware,
    authController,
    accountController,
    transactionController,
  };
}
