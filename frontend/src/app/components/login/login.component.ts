import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  isKiosk = false; // true when a kiosk session is active on this device

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.redirectByRole();
      return;
    }

    this.isKiosk = !!this.authService.getKioskStoreId();

    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password:   ['', [Validators.required]],
      storeId:    ['', this.isKiosk ? [] : [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.redirectByRole();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error ?? 'Login failed. Please try again.';
      }
    });
  }

  private redirectByRole(): void {
    this.authService.isAdmin()
      ? this.router.navigate(['/admin'])
      : this.router.navigate(['/dashboard']);
  }

  get identifierCtrl() { return this.loginForm.get('identifier'); }
  get passwordCtrl()   { return this.loginForm.get('password'); }
  get storeIdCtrl()    { return this.loginForm.get('storeId'); }
}
