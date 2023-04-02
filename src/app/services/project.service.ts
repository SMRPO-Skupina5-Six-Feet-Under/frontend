import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, combineLatest, map, Observable, of, throwError } from 'rxjs';
import { Project } from '../models/project';
import { UserService } from './user.service';
import { User } from '../models/user';
import { ProjectRole } from '../enums/project-role';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {


  loadProjects(): Observable<Project[]>{
    const endpoint = 'project/all';

    //napolnimo se z dolocenimi podatki za lazje operiranje
    return combineLatest([
      this.http.get<Project[]>(endpoint).pipe(catchError(err => this.handleError(err))),
      this.userService.getAllUsers()
      ]).pipe(
        map(([projects, users]: [Project[], User[]]) => {
          for (const project of projects) { //nastavimo propertije projektov za prikaz
            this.setProjectClientProperties(project, users);
          }
          return projects;
        })
    ); 
  }

  addProject(newProject: Project): Observable<Project>{
    const endpoint = 'project';

    return this.http.post<Project>(endpoint, newProject).pipe(
      catchError(err => this.handleError(err)),
    ); 
  }

  loadProjectById(id: number): Observable<Project>{
    const endpoint = `project/${id}`;

    return combineLatest([
      this.http.get<Project>(endpoint).pipe(catchError(err => this.handleError(err))),
      this.userService.getAllUsers()  
    ]).pipe(
      map(([project, users]: [Project, User[]]) => {
        this.setProjectClientProperties(project, users);
        return project;
      })
    );
  }

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private userService: UserService
  ) { }

  private setProjectClientProperties(project:Project, users: User[]){
    const scrumMasterUserId: number = project.projectParticipants.find(pp => pp.roleId === ProjectRole['Scrum master']).userId;
    const productOwnerUserId: number = project.projectParticipants.find(pp => pp.roleId === ProjectRole['Product owner']).userId;
    if(scrumMasterUserId){
      project.scrumMasterUserName = users.find(u => u.id === scrumMasterUserId).userName;
      project.scrumMasterUserId = scrumMasterUserId;
    }
    if(productOwnerUserId){
      project.productOwnerUserName = users.find(u => u.id === productOwnerUserId).userName;
      project.productOwnerUserId = productOwnerUserId;
    }
    const developerUserIds: number [] = project.projectParticipants.filter(pp => pp.roleId === ProjectRole.Developer).map(pp => pp.userId);
    project.developerParticipantUserNames = users.filter(u => developerUserIds.some(dui => dui === u.id)).map(u => u.userName);
  }


  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
      this.toastr.error('An error occurred: ' + error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Server error: ${error.status}, body was: `, error.error.detail);
      this.toastr.error(error.error?.detail, `Backend error: ${error.status}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => of(null)/* new Error('Something bad happened; please try again later.') */);
  }
}
