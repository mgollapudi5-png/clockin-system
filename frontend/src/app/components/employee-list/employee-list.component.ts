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

  showAddModal = false;
  addForm = { employeeName: '', employeeId: '', password: '' };
  addLoading = false;
  addError = '';

  showEditModal = false;
  editTarget: Employee | null = null;
  editForm = { employeeName: '', password: '' };
  editLoading = false;
  editError = '';

  showDeleteConfirm = false;
  deleteTarget: Employee | null = null;
  deleteLoading = false;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = '';
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => { this.employees = data; this.loading = false; },
      error: (err) => { this.error = err.error?.error ?? 'Failed to load employees.'; this.loading = false; }
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
      error: (err) => { alert(err.error?.error ?? 'Failed to update role.'); this.updatingId = null; }
    });
  }

  openAdd(): void {
    this.addForm = { employeeName: '', employeeId: '', password: '' };
    this.addError = '';
    this.showAddModal = true;
  }

  saveAdd(): void {
    this.addLoading = true;
    this.addError = '';
    this.employeeService.createEmployee(this.addForm).subscribe({
      next: (emp) => { this.employees.push(emp); this.showAddModal = false; this.addLoading = false; },
      error: (err) => { this.addError = err.error?.error ?? 'Failed to add employee.'; this.addLoading = false; }
    });
  }

  openEdit(emp: Employee): void {
    this.editTarget = emp;
    this.editForm = { employeeName: emp.employeeName, password: '' };
    this.editError = '';
    this.showEditModal = true;
  }

  saveEdit(): void {
    if (!this.editTarget) return;
    this.editLoading = true;
    this.editError = '';
    this.employeeService.updateEmployee(this.editTarget.id, this.editForm).subscribe({
      next: (updated) => {
        const idx = this.employees.findIndex(e => e.id === updated.id);
        if (idx !== -1) this.employees[idx] = updated as Employee;
        this.showEditModal = false;
        this.editLoading = false;
      },
      error: (err) => { this.editError = err.error?.error ?? 'Failed to update.'; this.editLoading = false; }
    });
  }

  openDelete(emp: Employee): void {
    this.deleteTarget = emp;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.deleteLoading = true;
    this.employeeService.deleteEmployee(this.deleteTarget.id).subscribe({
      next: () => {
        this.employees = this.employees.filter(e => e.id !== this.deleteTarget!.id);
        this.showDeleteConfirm = false;
        this.deleteLoading = false;
        this.deleteTarget = null;
      },
      error: () => { this.deleteLoading = false; alert('Failed to delete employee.'); }
    });
  }
}
