export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string; // Optional client binding ID for client-scoped invoicing
}
