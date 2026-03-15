import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { AttendanceRecord } from '../../models/clock-log.model';

interface EmployeeSummary {
  employeeName: string;
  employeeId: string;
  daysWorked: number;
  totalHours: number;
  avgHours: number;
  records: AttendanceRecord[];
}

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss']
})
export class AttendanceReportComponent implements OnInit {

  records: AttendanceRecord[] = [];
  summaries: EmployeeSummary[] = [];
  filteredSummaries: EmployeeSummary[] = [];

  loading = false;
  error = '';
  searched = false;

  searchTerm = '';
  preset: 'today' | 'week' | 'month' | 'custom' = 'month';
  fromDate = '';
  toDate = '';

  showDetailModal = false;
  detailEmployee: EmployeeSummary | null = null;

  dateError = '';

  ngOnInit(): void {
    this.applyPreset('month');
    this.search();
  }

  constructor(private employeeService: EmployeeService) {}

  applyPreset(p: 'today' | 'week' | 'month' | 'custom'): void {
    this.preset = p;
    if (p === 'custom') return;
    const today = new Date();
    this.toDate = this.fmt(today);
    if (p === 'today') {
      this.fromDate = this.fmt(today);
    } else if (p === 'week') {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      this.fromDate = this.fmt(d);
    } else {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      this.fromDate = this.fmt(d);
    }
    this.search();
  }

  validateCustom(): boolean {
    this.dateError = '';
    if (!this.fromDate || !this.toDate) { this.dateError = 'Please select both dates.'; return false; }
    const diff = (new Date(this.toDate).getTime() - new Date(this.fromDate).getTime()) / 86400000;
    if (diff < 0) { this.dateError = 'End date must be after start date.'; return false; }
    if (diff > 31) { this.dateError = 'Maximum range is 31 days.'; return false; }
    return true;
  }

  search(): void {
    if (this.preset === 'custom' && !this.validateCustom()) return;
    this.loading = true;
    this.error = '';
    this.searched = true;

    this.employeeService.getAttendance(this.fromDate, this.toDate).subscribe({
      next: (data) => {
        this.records = data;
        this.buildSummaries();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error ?? 'Failed to load data.';
        this.loading = false;
      }
    });
  }

  buildSummaries(): void {
    const map = new Map<string, EmployeeSummary>();
    for (const r of this.records) {
      if (!map.has(r.employeeId)) {
        map.set(r.employeeId, {
          employeeName: r.employeeName,
          employeeId: r.employeeId,
          daysWorked: 0,
          totalHours: 0,
          avgHours: 0,
          records: []
        });
      }
      const s = map.get(r.employeeId)!;
      s.records.push(r);
      s.daysWorked++;
      s.totalHours += r.totalHours ?? 0;
    }
    map.forEach(s => { s.avgHours = s.daysWorked > 0 ? s.totalHours / s.daysWorked : 0; });
    this.summaries = Array.from(map.values());
    this.applyFilter();
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredSummaries = term
      ? this.summaries.filter(s => s.employeeName.toLowerCase().includes(term) || s.employeeId.toLowerCase().includes(term))
      : [...this.summaries];
  }

  openDetail(s: EmployeeSummary): void {
    this.detailEmployee = s;
    this.showDetailModal = true;
  }

  exportCsv(): void {
    const header = 'Employee Name,Employee ID,Date,Clock In,Clock Out,Total Hours\n';
    const rows = this.records.map(r =>
      `"${r.employeeName}","${r.employeeId}","${r.date}","${r.clockInTime}","${r.clockOutTime}","${r.totalHours ?? ''}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${this.fromDate}_${this.toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getTotalHours(): number {
    return this.filteredSummaries.reduce((s, emp) => s + emp.totalHours, 0);
  }

  private fmt(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
