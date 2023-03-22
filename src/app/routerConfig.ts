
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { UsersComponent } from './components/users/users.component';
import { ProjectListComponent } from './components/project-list/project-list.component';

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
  },
  { path: 'users',
    component: UsersComponent
  },
  { path: 'projects',
    component: ProjectListComponent
  },
];
export default appRoutes;