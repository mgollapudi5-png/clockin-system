import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StoreAuthService } from '../services/store-auth.service';

@Injectable({ providedIn: 'root' })
export class CreatorGuard implements CanActivate {

  constructor(private storeAuthService: StoreAuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.storeAuthService.isCreator()) {
      return true;
    }
    this.router.navigate(['/store-portal']);
    return false;
  }
}
