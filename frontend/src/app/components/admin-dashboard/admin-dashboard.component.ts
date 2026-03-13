import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ClockService } from '../../services/clock.service';
import { CurrentUser } from '../../models/employee.model';
import { ClockResponse } from '../../models/clock-log.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  currentUser: CurrentUser | null = null;
  activeTab: 'tracker' | 'employees' | 'analysis' = 'tracker';

  // Clock tracker state
  currentTime = new Date();
  isClockedIn = false;
  clockLoading = false;
  clockMessage = '';
  clockMessageType: 'success' | 'error' | 'info' = 'info';

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private authService: AuthService,
    private clockService: ClockService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.timer = setInterval(() => this.currentTime = new Date(), 1000);
    this.loadClockStatus();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  loadClockStatus(): void {
    this.clockService.getStatus().subscribe({
      next: (res: ClockResponse) => { this.isClockedIn = res.clockedIn; },
      error: () => {}
    });
  }

  clockIn(): void {
    this.clockLoading = true;
    this.clockService.clockIn().subscribe({
      next: (res: ClockResponse) => {
        this.isClockedIn = true;
        this.showClockMsg(res.message, 'success');
        this.clockLoading = false;
      },
      error: (err: any) => {
        this.showClockMsg(err.error?.error ?? 'Clock in failed.', 'error');
        this.clockLoading = false;
      }
    });
  }

  clockOut(): void {
    this.clockLoading = true;
    this.clockService.clockOut().subscribe({
      next: (res: ClockResponse) => {
        this.isClockedIn = false;
        this.showClockMsg(res.message, 'success');
        this.clockLoading = false;
      },
      error: (err: any) => {
        this.showClockMsg(err.error?.error ?? 'Clock out failed.', 'error');
        this.clockLoading = false;
      }
    });
  }

  private showClockMsg(msg: string, type: 'success' | 'error' | 'info'): void {
    this.clockMessage = msg;
    this.clockMessageType = type;
    setTimeout(() => this.clockMessage = '', 5000);
  }

  logout(): void {
    this.authService.logout();
  }
}
