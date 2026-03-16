import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { StoreAuthService } from '../../services/store-auth.service';
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
    private employeeService: EmployeeService,
    private storeAuthService: StoreAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.storeAuthService.isKioskActive()) {
      this.authService.logout();
      this.router.navigate(['/store-portal']);
      return;
    }

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
