export interface Session {
  id: string;
  userId: string;
  sessionId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
