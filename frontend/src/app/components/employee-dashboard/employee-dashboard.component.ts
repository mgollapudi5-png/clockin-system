import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ClockService } from '../../services/clock.service';
import { CurrentUser } from '../../models/employee.model';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {

  currentUser: CurrentUser | null = null;
  currentTime = new Date();
  isClockedIn = false;
  lastClockIn: string | null = null;
  lastClockOut: string | null = null;
  lastTotalHours: number | null = null;
  message = '';
  messageType: 'success' | 'error' | 'info' = 'info';
  loading = false;

  private clockInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private authService: AuthService,
    private clockService: ClockService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.clockInterval = setInterval(() => this.currentTime = new Date(), 1000);
    this.loadStatus();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  loadStatus(): void {
    this.clockService.getStatus().subscribe({
      next: (res) => {
        this.isClockedIn = res.clockedIn;
        this.lastClockIn = res.clockInTime;
      },
      error: () => {}
    });
  }

  clockIn(): void {
    this.loading = true;
    this.message = '';
    this.clockService.clockIn().subscribe({
      next: (res) => {
        this.isClockedIn = true;
        this.lastClockIn = res.clockInTime;
        this.lastClockOut = null;
        this.lastTotalHours = null;
        this.showMessage(res.message, 'success');
        this.loading = false;
      },
      error: (err) => {
        this.showMessage(err.error?.error ?? 'Clock in failed.', 'error');
        this.loading = false;
      }
    });
  }

  clockOut(): void {
    this.loading = true;
    this.message = '';
    this.clockService.clockOut().subscribe({
      next: (res) => {
        this.isClockedIn = false;
        this.lastClockOut = res.clockOutTime;
        this.lastTotalHours = res.totalHours;
        this.showMessage(res.message, 'success');
        this.loading = false;
      },
      error: (err) => {
        this.showMessage(err.error?.error ?? 'Clock out failed.', 'error');
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private showMessage(msg: string, type: 'success' | 'error' | 'info'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 5000);
  }
}
