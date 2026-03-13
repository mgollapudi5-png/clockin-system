import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee } from '../models/employee.model';
import { AttendanceRecord } from '../models/clock-log.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees`);
  }

  createEmployee(data: { employeeId: string; employeeName: string; password: string; role: string }): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/employees`, data);
  }

  updateEmployee(id: number, data: { employeeName: string; password: string; role: string }): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/employees/${id}`, data);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/employees/${id}`);
  }

  updateRole(id: number, role: string): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/employees/${id}/role`, { role });
  }

  getAttendance(fromDate: string, toDate: string, employeeId?: string): Observable<AttendanceRecord[]> {
    let params = new HttpParams().set('fromDate', fromDate).set('toDate', toDate);
    if (employeeId) params = params.set('employeeId', employeeId);
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/attendance`, { params });
  }
}
