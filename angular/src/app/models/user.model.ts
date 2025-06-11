export interface User {
  id: string | number;
  email: string;
  password: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}
