import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { StoreAuthService } from '../services/store-auth.service';

@Injectable({ providedIn: 'root' })
export class KioskGuard implements CanActivate {

  constructor(private storeAuthService: StoreAuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    if (!this.storeAuthService.isKioskActive()) {
      this.router.navigate(['/store-portal']);
      return of(false);
    }

    return this.storeAuthService.verifyKioskSession().pipe(
      map(res => {
        if (res.valid) {
          return true;
        }
        this.storeAuthService.clearKioskSession();
        this.router.navigate(['/store-portal']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/store-portal']);
        return of(false);
      })
    );
  }
}
