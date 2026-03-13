import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginComponent } from './components/login/login.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  { path: '',         redirectTo: '/login', pathMatch: 'full' },
  { path: 'login',    component: LoginComponent },
  { path: 'dashboard', component: EmployeeDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin',    component: AdminDashboardComponent,    canActivate: [AuthGuard, AdminGuard] },
  { path: '**',       redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
