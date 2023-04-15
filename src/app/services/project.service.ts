import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, combineLatest, map, Observable} from 'rxjs';
import { Project } from '../models/project';
import { UserService } from './user.service';
import { User } from '../models/user';
import { ProjectRole } from '../enums/project-role';
import { HandleErrorService } from './handler-error.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {


  loadProjects(): Observable<Project[]>{
    const endpoint = 'project/all';

    //napolnimo se z dolocenimi podatki za lazje operiranje
    return combineLatest([
      this.http.get<Project[]>(endpoint).pipe(catchError(err => this.handleErrorService.handleError(err))),
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
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  loadProjectById(id: number): Observable<Project>{
    const endpoint = `project/${id}`;

    return combineLatest([
      this.http.get<Project>(endpoint).pipe(catchError(err => this.handleErrorService.handleError(err))),
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
    private userService: UserService,
    private handleErrorService: HandleErrorService
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

    project.developerFullNamesIds = [];
    project.developerParticipantUserNames.forEach(uName => {
      const usr = users.find(u => u.userName === uName);
      if(usr)
        project.developerFullNamesIds.push({id: usr.id, fullName: usr.firstName + ' ' + usr.lastName});
    });
  }

}
