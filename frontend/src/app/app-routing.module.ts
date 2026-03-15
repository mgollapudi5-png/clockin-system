import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { KioskGuard } from './guards/kiosk.guard';
import { CreatorGuard } from './guards/creator.guard';
import { LoginComponent } from './components/login/login.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { StorePortalComponent } from './components/store-portal/store-portal.component';
import { CreatorPanelComponent } from './components/creator-panel/creator-panel.component';
import { KioskComponent } from './components/kiosk/kiosk.component';

const routes: Routes = [
  { path: '',             redirectTo: '/login', pathMatch: 'full' },
  { path: 'login',        component: LoginComponent },
  { path: 'dashboard',    component: EmployeeDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin',        component: AdminDashboardComponent,    canActivate: [AuthGuard, AdminGuard] },
  { path: 'store-portal', component: StorePortalComponent },
  { path: 'kiosk',        component: KioskComponent,            canActivate: [KioskGuard] },
  { path: 'creator',      component: CreatorPanelComponent,     canActivate: [CreatorGuard] },
  { path: '**',           redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
