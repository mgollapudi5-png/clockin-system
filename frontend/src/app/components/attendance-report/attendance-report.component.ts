import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { AttendanceRecord } from '../../models/clock-log.model';

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss']
})
export class AttendanceReportComponent implements OnInit {

  filterForm!: FormGroup;
  records: AttendanceRecord[] = [];
  loading = false;
  error = '';
  searched = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm = this.fb.group({
      fromDate: [this.toDateStr(firstDay), [Validators.required]],
      toDate:   [this.toDateStr(today),    [Validators.required]]
    });
  }

  search(): void {
    if (this.filterForm.invalid) return;

    const { fromDate, toDate } = this.filterForm.value;
    this.loading = true;
    this.error = '';
    this.searched = true;

    this.employeeService.getAttendance(fromDate, toDate).subscribe({
      next: (data) => {
        this.records = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error ?? 'Failed to load attendance data.';
        this.loading = false;
      }
    });
  }

  getTotalHours(): number {
    return this.records
      .filter(r => r.totalHours != null)
      .reduce((sum, r) => sum + (r.totalHours ?? 0), 0);
  }

  private toDateStr(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
