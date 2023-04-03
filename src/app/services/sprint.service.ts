import { Injectable } from '@angular/core';
import { Sprint } from '../models/sprint';
import { Observable, catchError, of, tap } from 'rxjs';
import { HandleErrorService } from './handler-error.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class SprintService {

  loadProjectSprints(projectId: number): Observable<Sprint[]>{
    const endpoint = `sprint/${projectId}/all`;

    return this.http.get<Sprint[]>(endpoint).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  loadSprint(sprintId: number): Observable<Sprint>{
    const endpoint = `sprint/${sprintId}`;

    return this.http.get<Sprint>(endpoint).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  saveSprint(sprint: Sprint): Observable<Sprint>{
    sprint.startDate = new Date(sprint.startDate);
    sprint.endDate = new Date(sprint.endDate);
    if(sprint.id) //*if sprint has id (it's already in db) update it
      return this.updateSprint(sprint);
    else
      return this.addSprint(sprint);
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
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  private updateSprint(sprint: Sprint): Observable<Sprint>{
    //TODO implement update
    return of(null);
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


}
