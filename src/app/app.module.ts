import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';

import appRoutes from './routerConfig';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InterceptorService } from './services/interceptor.service';
import { DatePipe } from '@angular/common';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { UserStoryPopupComponent } from './components/popups/user-story-popup/user-story-popup.component';
import { ProductBacklogComponent } from './components/project-details/product-backlog/product-backlog.component';
import { StoryCardComponent } from './components/project-details/story-card/story-card.component';
import { SprintPopupComponent } from './components/popups/sprint-popup/sprint-popup.component';
import { SprintListComponent } from './components/project-details/sprint-list/sprint-list.component';
import { UsersEditPopupComponent } from './components/popups/users-edit-popup/users-edit-popup.component';
import { ChangePasswordPopupComponent } from './components/popups/change-password-popup/change-password-popup.component';
import { SprintBacklogComponent } from './components/project-details/sprint-backlog/sprint-backlog.component';
import { StoryTasksPopupComponent } from './components/popups/story-tasks-popup/story-tasks-popup.component';
import { SprintTasksComponent } from './components/sprint-tasks/sprint-tasks.component';
import { TaskCardComponent } from './components/sprint-tasks/task-card/task-card.component';
import { TaskPopupComponent } from './components/popups/task-popup/task-popup.component';
import { ProjectForumComponent } from './components/project-details/project-forum/project-forum.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    DashboardComponent,
    UserDetailsComponent,
    UsersComponent,
    ProjectListComponent,
    ProjectDetailsComponent,
    UserStoryPopupComponent,
    ProductBacklogComponent,
    StoryCardComponent,
    SprintPopupComponent,
    SprintListComponent,
    UsersEditPopupComponent,
    ChangePasswordPopupComponent,
    SprintBacklogComponent,
    StoryTasksPopupComponent,
    SprintTasksComponent,
    TaskCardComponent,
    TaskPopupComponent,
    ProjectForumComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    RouterModule.forRoot(appRoutes),
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot()
  ],
  providers: [
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
