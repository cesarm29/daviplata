export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string;
  documentId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: Date;
}
