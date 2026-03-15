import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CurrentUser, LoginRequest, LoginResponse } from '../models/employee.model';

const USER_KEY = 'clockin_user';
const KIOSK_KEY = 'kiosk_session';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  private getKioskToken(): string {
    const raw = localStorage.getItem(KIOSK_KEY);
    if (!raw) return '';
    try { return JSON.parse(raw)?.sessionToken ?? ''; } catch { return ''; }
  }

  getKioskStoreId(): string {
    const raw = localStorage.getItem(KIOSK_KEY);
    if (!raw) return '';
    try { return JSON.parse(raw)?.storeId ?? ''; } catch { return ''; }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    const kioskToken = this.getKioskToken();
    const kioskStoreId = this.getKioskStoreId();

    const payload: LoginRequest = {
      ...request,
      storeId: request.storeId || kioskStoreId || undefined
    };

    const headers = new HttpHeaders(kioskToken ? { 'X-Kiosk-Token': kioskToken } : {});

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload, { headers }).pipe(
      tap(res => {
        const user: CurrentUser = {
          token: res.token,
          employeeId: res.employeeId,
          employeeName: res.employeeName,
          role: res.role,
          storeId: res.storeId
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getToken(): string | null {
    return this.getCurrentUser()?.token ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
  }
}
