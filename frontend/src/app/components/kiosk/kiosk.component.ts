import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { StoreAuthService } from '../../services/store-auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-kiosk',
  templateUrl: './kiosk.component.html',
  styleUrls: ['./kiosk.component.scss']
})
export class KioskComponent implements OnInit, OnDestroy {
  storeName = '';
  currentTime = '';
  currentDate = '';

  employeeId = '';
  password = '';
  showPassword = false;
  loading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  private clockInterval: any;
  private messageTimeout: any;

  constructor(
    private http: HttpClient,
    private storeAuthService: StoreAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.storeName = this.storeAuthService.getKioskSession()?.storeName ?? 'Store';
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.clockInterval);
    clearTimeout(this.messageTimeout);
  }

  updateClock(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  private getHeaders(): HttpHeaders {
    const token = this.storeAuthService.getKioskSession()?.sessionToken ?? '';
    return new HttpHeaders({ 'X-Kiosk-Token': token });
  }

  clockAction(action: 'IN' | 'OUT'): void {
    if (!this.employeeId.trim() || !this.password.trim()) {
      this.showMessage('Please enter Employee ID and Password.', 'error');
      return;
    }

    this.loading = true;
    this.message = '';

    this.http.post<any>(
      `${environment.apiUrl}/kiosk/clock`,
      { employeeId: this.employeeId, password: this.password, action },
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        this.loading = false;
        const label = action === 'IN' ? 'Clocked In' : 'Clocked Out';
        this.showMessage(`✓ ${label} successfully!`, 'success');
        this.employeeId = '';
        this.password = '';
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.error || 'Something went wrong. Please try again.';
        if (msg.toLowerCase().includes('kiosk')) {
          this.storeAuthService.clearKioskSession();
          this.router.navigate(['/store-portal']);
          return;
        }
        this.showMessage(msg, 'error');
      }
    });
  }

  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 4000);
  }
}
