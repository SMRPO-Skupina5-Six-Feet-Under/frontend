import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators'; 
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { LogInData } from '../models/logInData';
import { ToastrService } from 'ngx-toastr';
import { User, UserCreate } from '../models/user';



@Injectable({
  providedIn: 'root',
})
export class UserService {
  private REST_API_SERVER = "http://localhost:8003/"; // najt nacin da to daš generic

  constructor(private httpClient: HttpClient,
    private toastr: ToastrService,) { }

  getAllUsers(): Observable<User[]> {
    const url = "users"
    return this.httpClient.get<User[]>(this.REST_API_SERVER + url)
      .pipe(
        catchError(er => this.handleError(er))
      );
  }

  addNewUser(newUser: UserCreate): Observable<User>{
    const url = "users"
    return this.httpClient.post<User>(this.REST_API_SERVER + url, newUser)
      .pipe(
        catchError(er => this.handleError(er))
      );
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