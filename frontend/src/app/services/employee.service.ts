import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee, DashboardData } from '../models/employee.model';
import { AttendanceRecord } from '../models/clock-log.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees`);
  }

  createEmployee(data: { employeeName: string; employeeId: string; password: string }): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/employees`, data);
  }

  updateEmployee(id: number, data: { employeeName?: string; password?: string }): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/employees/${id}`, data);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/employees/${id}`);
  }

  updateRole(id: number, role: string): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/employees/${id}/role`, { role });
  }

  getAttendance(fromDate: string, toDate: string): Observable<AttendanceRecord[]> {
    const params = new HttpParams().set('fromDate', fromDate).set('toDate', toDate);
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/attendance`, { params });
  }
}
