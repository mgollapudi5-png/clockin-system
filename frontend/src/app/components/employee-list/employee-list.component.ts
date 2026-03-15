import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {

  employees: Employee[] = [];
  loading = false;
  error = '';
  updatingId: number | null = null;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = '';
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error ?? 'Failed to load employees.';
        this.loading = false;
      }
    });
  }

  toggleRole(employee: Employee): void {
    const newRole = employee.role === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN';
    this.updatingId = employee.id;

    this.employeeService.updateRole(employee.id, newRole).subscribe({
      next: (updated) => {
        const idx = this.employees.findIndex(e => e.id === updated.id);
        if (idx !== -1) this.employees[idx] = updated as Employee;
        this.updatingId = null;
      },
      error: (err) => {
        alert(err.error?.error ?? 'Failed to update role.');
        this.updatingId = null;
      }
    });
  }
}
