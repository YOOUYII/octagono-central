export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  status: number;
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
  points?: number;
}
