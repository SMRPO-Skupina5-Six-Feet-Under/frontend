import { HttpClient } from '@angular/common/http';
import { enableProdMode, Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { catchError, combineLatest, filter, forkJoin, map, Observable, of, take} from 'rxjs';
import { Project, ProjectDocumentation } from '../models/project';
import { Message, NewMessage } from '../models/message';
import { UserService } from './user.service';
import { User } from '../models/user';
import { ProjectRole } from '../enums/project-role';
import { HandleErrorService } from './handler-error.service';
import { ProjectParticipantsInput } from '../models/projectParticipantsInput';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  userCacheCount = 0;

  loadProjects(): Observable<Project[]>{
    const endpoint = 'project/all';

    let usersObservable: Observable<User[]> = this.userService.allUsers$
    .asObservable().pipe(filter(users => users != null && users.length > 0), take(1));
    if(this.userCacheCount > 50){
      usersObservable = this.userService.getAllUsers();
      this.userCacheCount = 0;
    }
    this.userCacheCount++;

    //napolnimo se z dolocenimi podatki za lazje operiranje
    return combineLatest([
      this.http.get<Project[]>(endpoint).pipe(catchError(err => this.handleErrorService.handleError(err))),
      usersObservable
      ]).pipe(
        map(([projects, users]: [Project[], User[]]) => {
          for (const project of projects) { //nastavimo propertije projektov za prikaz
            this.setProjectClientProperties(project, users);
          }
          return projects.sort((a,b) => a.id - b.id);
        })
    ); 
  }


  //#region Save project
  saveProject(project: Project): Observable<Project>{
    if(project == null) return of(null);
    if(project.id)
      return this.updateProject(project);
    else
      return this.addProject(project);
  }

  private addProject(newProject: Project): Observable<Project>{
    const endpoint = 'project';

    return this.http.post<Project>(endpoint, newProject).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  private updateProject(project:Project): Observable<Project>{
    const endpoint = `project/${project.id}/data`;

    return forkJoin([this.http.put<Project>(endpoint, project).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    ),
    this.updateProjectParticipants(project)
    ]).pipe(
      map(([project, projectParticipants]: [Project, ProjectParticipantsInput[]]) => {
        project.projectParticipants = projectParticipants;
        return project;
      })
    );
  }

  private updateProjectParticipants(project:Project): Observable<ProjectParticipantsInput[]>{
    const endpoint = `project/${project.id}/participants`;

    return this.http.put<ProjectParticipantsInput[]>(endpoint, project.projectParticipants).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }

  //#endregion

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

  //#region Messages

  loadMessages(projectId: number): Observable<Message[]>{
    const endpoint = `messages/${projectId}/all`;

    return combineLatest([
      this.http.get<Message[]>(endpoint).pipe(catchError(err => this.handleErrorService.handleError(err))),
      this.userService.getAllUsers()
    ]).pipe(
      map(([messages, users]: [Message[], User[]]) => {
        for (const message of messages) { //nastavimo propertije projektov za prikaz
          this.setMessageClientProperties(message, users);
        }
        return messages.sort((a,b) => a.timestamp.valueOf() - b.timestamp.valueOf());
      })
    );
  }

  sendMessage(projectId: number, newMessage: NewMessage): Observable<Message>{
    const endpoint = `messages/${projectId}`;

    return combineLatest([
      this.http.post<Message>(endpoint, newMessage).pipe(catchError(err => this.handleErrorService.handleError(err))),
      this.userService.getAllUsers()
    ]).pipe(
      map(([message, users]: [Message, User[]]) => {
        this.setMessageClientProperties(message, users);
        return message;
      })
    );
  }

  //#endregion

  //#region Documentation

  /*
  convertFileToString(file: File){
    const endpoint = `project/documentation/import`;

    return this.http.post<string>(endpoint, file).pipe(
      catchError(err => this.handleErrorService.handleError(err))
    );
  }
  */

  saveDocumentation(projectId: number, content: ProjectDocumentation){
    const endpoint = `project/documentation/${projectId}`;

    return this.http.put<string>(endpoint, content).pipe(
      catchError(err => this.handleErrorService.handleError(err))
    );
  }

  //#endregion

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

  private setMessageClientProperties(message: Message, users: User[]){
    const usr = users.find(u => u.id == message.userId);
    const datepipe: DatePipe = new DatePipe('en-US');
    if(usr){
      message.userFullName = usr.firstName + " " + usr.lastName;
      let formattedDate = datepipe.transform(message.timestamp, 'dd.MM.YYYY HH:mm:ss')
      message.date = formattedDate;
    }
  }
}
