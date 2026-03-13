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

  // Inline edit state
  editingId: number | null = null;
  editData: { employeeName: string; password: string; role: string } = { employeeName: '', password: '', role: '' };
  savingId: number | null = null;
  deletingId: number | null = null;

  // Add employee form
  newEmp = { employeeId: '', employeeName: '', password: '', role: 'EMPLOYEE' };
  adding = false;
  addError = '';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = '';
    this.employeeService.getAllEmployees().subscribe({
      next: (data: Employee[]) => { this.employees = data; this.loading = false; },
      error: (err: any) => { this.error = err.error?.error ?? 'Failed to load employees.'; this.loading = false; }
    });
  }

  startEdit(emp: Employee): void {
    this.editingId = emp.id;
    this.editData = { employeeName: emp.employeeName, password: '', role: emp.role };
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(emp: Employee): void {
    this.savingId = emp.id;
    this.employeeService.updateEmployee(emp.id, this.editData).subscribe({
      next: (updated: Employee) => {
        const idx = this.employees.findIndex(e => e.id === updated.id);
        if (idx !== -1) this.employees[idx] = updated;
        this.editingId = null;
        this.savingId = null;
      },
      error: (err: any) => {
        alert(err.error?.error ?? 'Failed to update employee.');
        this.savingId = null;
      }
    });
  }

  deleteEmployee(emp: Employee): void {
    if (!confirm(`Delete ${emp.employeeName}? This will also remove their clock logs.`)) return;
    this.deletingId = emp.id;
    this.employeeService.deleteEmployee(emp.id).subscribe({
      next: () => {
        this.employees = this.employees.filter(e => e.id !== emp.id);
        this.deletingId = null;
      },
      error: (err: any) => {
        alert(err.error?.error ?? 'Failed to delete employee.');
        this.deletingId = null;
      }
    });
  }

  addEmployee(): void {
    this.addError = '';
    if (!this.newEmp.employeeId.trim() || !this.newEmp.employeeName.trim() || !this.newEmp.password.trim()) {
      this.addError = 'All fields are required.';
      return;
    }
    this.adding = true;
    this.employeeService.createEmployee(this.newEmp).subscribe({
      next: (created: Employee) => {
        this.employees.push(created);
        this.newEmp = { employeeId: '', employeeName: '', password: '', role: 'EMPLOYEE' };
        this.adding = false;
      },
      error: (err: any) => {
        this.addError = err.error?.error ?? 'Failed to create employee.';
        this.adding = false;
      }
    });
  }
}
