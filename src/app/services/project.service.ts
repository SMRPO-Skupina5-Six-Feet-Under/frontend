import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Project } from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {


  loadProjects(): Observable<Project[]>{
    const endpoint = 'project/all';

    return this.http.get<Project[]>(endpoint).pipe(
      catchError(err => this.handleError(err)),
    ); 
  }

  addProject(newProject: Project): Observable<Project>{
    const endpoint = 'project';

    return this.http.post<Project>(endpoint, newProject).pipe(
      catchError(err => this.handleError(err)),
    ); 
  }

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
  ) { }


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
