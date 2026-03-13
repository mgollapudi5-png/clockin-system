export interface ClockResponse {
  message: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  totalHours: number | null;
  clockedIn: boolean;
}

export interface AttendanceRecord {
  employeeName: string;
  employeeId: string;
  date: string;
  clockInTime: string;
  clockOutTime: string;
  totalHours: number | null;
}
