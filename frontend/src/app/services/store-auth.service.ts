import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { StoreLoginRequest, StoreLoginResponse, KioskSession, CreatorUser } from '../models/store.model';

const KIOSK_KEY = 'kiosk_session';
const CREATOR_KEY = 'creator_user';

@Injectable({ providedIn: 'root' })
export class StoreAuthService {

  private readonly apiUrl = `${environment.apiUrl}/store`;

  constructor(private http: HttpClient, private router: Router) {}

  login(request: StoreLoginRequest): Observable<StoreLoginResponse> {
    const deviceInfo = navigator.userAgent;
    return this.http.post<StoreLoginResponse>(`${this.apiUrl}/login`, { ...request, deviceInfo }).pipe(
      tap(res => {
        if (res.role === 'STORE_OWNER') {
          const kiosk: KioskSession = {
            sessionToken: res.sessionToken ?? '',
            storeName: res.storeName,
            storeId: res.storeId,
            expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000
          };
          localStorage.setItem(KIOSK_KEY, JSON.stringify(kiosk));
        } else if (res.role === 'CREATOR' && res.token) {
          const creator: CreatorUser = {
            token: res.token,
            storeId: res.storeId,
            storeName: res.storeName
          };
          localStorage.setItem(CREATOR_KEY, JSON.stringify(creator));
        }
      })
    );
  }

  verifyKioskSession(): Observable<{ valid: boolean }> {
    const session = this.getKioskSession();
    const token = session?.sessionToken ?? '';
    return this.http.get<{ valid: boolean }>(`${this.apiUrl}/kiosk/verify`, {
      headers: { 'X-Kiosk-Token': token }
    });
  }

  getKioskSession(): KioskSession | null {
    const raw = localStorage.getItem(KIOSK_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getCreatorUser(): CreatorUser | null {
    const raw = localStorage.getItem(CREATOR_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getCreatorToken(): string | null {
    return this.getCreatorUser()?.token ?? null;
  }

  isKioskActive(): boolean {
    const raw = localStorage.getItem(KIOSK_KEY);
    if (!raw) return false;
    const session: KioskSession = JSON.parse(raw);
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(KIOSK_KEY);
      return false;
    }
    return true;
  }

  isCreator(): boolean {
    return !!this.getCreatorUser();
  }

  clearKioskSession(): void {
    localStorage.removeItem(KIOSK_KEY);
  }

  logoutCreator(): void {
    localStorage.removeItem(CREATOR_KEY);
    this.router.navigate(['/store-portal']);
  }
}
