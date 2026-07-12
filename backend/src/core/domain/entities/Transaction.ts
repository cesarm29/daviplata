export interface Transaction {
  id: string;
  userId: string;
  sourceAccountId: string;
  destinationPhone: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  description: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}
