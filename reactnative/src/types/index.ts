export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  destinationPhone: string;
  sourceAccountId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface LoginResult {
  sessionId: string;
  token: string;
  user: UserData;
}

export interface BundleProps {
  onEvent?: (event: string, data?: any) => void;
  userData?: UserData;
  theme?: Theme;
  movementsData?: Transaction[];
  page?: number;
  refreshing?: boolean;
  onLoadMore?: () => void;
}
