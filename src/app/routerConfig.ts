
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';

const appRoutes: Routes = [
  { path: 'home', 
    component: HomeComponent 
  },
  {
    path: 'login',
    component: LoginComponent
  },
  { path: 'dashboard',
    component: DashboardComponent
  },
  { path: 'user_details',
    component: UserDetailsComponent
  }
];
export default appRoutes;