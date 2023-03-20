import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { UsersComponent } from './components/users/users.component';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'user_details',
    component: UserDetailsComponent,
    canActivate:[AuthGuardService] 
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate:[AuthGuardService] 
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate:[AuthGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
