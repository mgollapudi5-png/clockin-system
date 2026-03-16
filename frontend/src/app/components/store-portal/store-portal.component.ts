import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StoreAuthService } from '../../services/store-auth.service';

@Component({
  selector: 'app-store-portal',
  templateUrl: './store-portal.component.html',
  styleUrls: ['./store-portal.component.scss']
})
export class StorePortalComponent {
  storeId = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(private storeAuthService: StoreAuthService, private router: Router) {}

  login(): void {
    this.error = '';
    this.loading = true;

    this.storeAuthService.login({ storeId: this.storeId, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.role === 'STORE_OWNER') {
          this.router.navigate(['/login']);
        } else if (res.role === 'CREATOR') {
          this.router.navigate(['/creator']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Invalid credentials. Please try again.';
      }
    });
  }
}
