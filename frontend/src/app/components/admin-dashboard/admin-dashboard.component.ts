import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CurrentUser } from '../../models/employee.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  currentUser: CurrentUser | null = null;
  activeTab: 'employees' | 'attendance' = 'employees';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
