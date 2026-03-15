import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { CurrentUser, DashboardData } from '../../models/employee.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  currentUser: CurrentUser | null = null;
  activeTab: 'dashboard' | 'employees' | 'hours' = 'dashboard';

  dashboard: DashboardData | null = null;
  dashLoading = false;
  dashError = '';

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboard();
  }

  switchTab(tab: 'dashboard' | 'employees' | 'hours'): void {
    this.activeTab = tab;
    if (tab === 'dashboard') this.loadDashboard();
  }

  loadDashboard(): void {
    this.dashLoading = true;
    this.dashError = '';
    this.employeeService.getDashboard().subscribe({
      next: (data) => { this.dashboard = data; this.dashLoading = false; },
      error: () => { this.dashError = 'Failed to load dashboard.'; this.dashLoading = false; }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
