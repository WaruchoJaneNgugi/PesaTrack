export interface User {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: 'admin' | 'employee';
  createdAt: number;
}

export interface Request {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhone: string;
  amount: number;
  category: 'supplies' | 'travel' | 'meals' | 'other';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  receiptUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export type Page =
  | 'dashboard'
  | 'new-request'
  | 'my-requests'
  | 'all-requests'
  | 'employees';
