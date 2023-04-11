import { Injectable } from '@angular/core';
import { Sprint } from '../models/sprint';
import { Observable, catchError, of, tap, map } from 'rxjs';
import { HandleErrorService } from './handler-error.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { SprintStatus } from '../enums/sprint-status';

@Injectable({
  providedIn: 'root'
})
export class SprintService {

  loadProjectSprints(projectId: number): Observable<Sprint[]>{
    const endpoint = `sprint/${projectId}/all`;

    return this.http.get<Sprint[]>(endpoint).pipe(
      map(sprints => this.setSprints(sprints)),
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  loadSprint(sprintId: number): Observable<Sprint>{
    const endpoint = `sprint/${sprintId}`;

    return this.http.get<Sprint>(endpoint).pipe(
      map(sprint => this.setSprintStatus(sprint)),
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  saveSprint(sprint: Sprint): Observable<Sprint>{
    sprint.startDate = new Date(sprint.startDate);
    sprint.endDate = new Date(sprint.endDate);
    let obs: Observable<Sprint>;
    if(sprint.id) //*if sprint has id (it's already in db) update it
      obs = this.updateSprint(sprint);
    else
      obs = this.addSprint(sprint);

    return obs.pipe(
      map(sprint => this.setSprintStatus(sprint))
    );
  }

  private addSprint(newSprint: Sprint): Observable<Sprint>{
    if(!newSprint){
      this.toastr.error("Sprint is null");
      return of(null)
    }
    if(!newSprint.projectId){
      this.toastr.error("Sprint's project id is null");
      return of(null)
    }

    const endpoint = `sprint/${newSprint.projectId}`;
    return this.http.post<Sprint>(endpoint, newSprint).pipe(
      tap(() => this.toastr.success("Sprint added successfully")),
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  private updateSprint(sprint: Sprint): Observable<Sprint>{
    const endpoint = `sprint/${sprint.id}`;
    return this.http.patch<Sprint>(endpoint, sprint).pipe(
      tap(() => this.toastr.success("Sprint updated successfully")),
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }


  deleteSprint(sprintId: number): Observable<Sprint>{
    const endpoint = `sprint/${sprintId}`;
    
    return this.http.delete<Sprint>(endpoint).pipe(
      tap(() => this.toastr.success("Sprint deleted successfully")),
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }



  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService,
    private toastr: ToastrService
  ) { }

  private setSprints(sprints: Sprint[]): Sprint []{
    let setSprints: Sprint[] = [];
    sprints.forEach(s => {
      const setSprint = this.setSprintStatus(s);
      setSprints.push(setSprint);
    });

    return setSprints
  }

  private setSprintStatus(s: Sprint): Sprint{
    const sprint: Sprint = JSON.parse(JSON.stringify(s)); //deep copy
    const startDate = new Date(sprint.startDate);
    startDate.setHours(0,0,0,0);
    const endDate = new Date(sprint.endDate);
    endDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);

    if(today >= startDate && today <= endDate)
      sprint.status = SprintStatus.active;
    else if(today > endDate)
      sprint.status = SprintStatus.finished;

    return sprint;
  }

}
