import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { AttendanceRecord } from '../../models/clock-log.model';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss']
})
export class AttendanceReportComponent implements OnInit {

  // Filter fields
  selectedEmployeeId = '';
  fromDate = '';
  toDate = '';
  startTime = '';
  endTime = '';

  employees: Employee[] = [];
  records: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];
  loading = false;
  error = '';
  searched = false;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.fromDate = this.toDateStr(firstDay);
    this.toDate = this.toDateStr(today);
    this.employeeService.getAllEmployees().subscribe({
      next: (data: Employee[]) => { this.employees = data; },
      error: () => {}
    });
  }

  search(): void {
    if (!this.fromDate || !this.toDate) { this.error = 'Start and end date are required.'; return; }
    this.loading = true;
    this.error = '';
    this.searched = true;
    this.employeeService.getAttendance(this.fromDate, this.toDate, this.selectedEmployeeId || undefined).subscribe({
      next: (data: AttendanceRecord[]) => {
        this.records = data;
        this.applyTimeFilter();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.error ?? 'Failed to load data.';
        this.loading = false;
      }
    });
  }

  private applyTimeFilter(): void {
    if (!this.startTime && !this.endTime) {
      this.filteredRecords = this.records;
      return;
    }
    this.filteredRecords = this.records.filter(r => {
      if (r.clockInTime === 'In Progress') return true;
      const inTime = r.clockInTime;
      const outTime = r.clockOutTime === 'In Progress' ? null : r.clockOutTime;
      if (this.startTime && inTime < this.startTime) return false;
      if (this.endTime && outTime && outTime > this.endTime) return false;
      return true;
    });
  }

  getSummary(): { name: string; id: string; totalHours: number }[] {
    const map: { [key: string]: { name: string; id: string; totalHours: number } } = {};
    this.filteredRecords.forEach(r => {
      if (!map[r.employeeId]) map[r.employeeId] = { name: r.employeeName, id: r.employeeId, totalHours: 0 };
      map[r.employeeId].totalHours += r.totalHours ?? 0;
    });
    return Object.values(map);
  }

  private toDateStr(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
