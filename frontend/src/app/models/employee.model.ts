export interface Employee {
  id: number;
  employeeId: string;
  employeeName: string;
  role: 'EMPLOYEE' | 'ADMIN';
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  employeeId: string;
  employeeName: string;
  role: string;
}

export interface CurrentUser {
  employeeId: string;
  employeeName: string;
  role: string;
  token: string;
}
