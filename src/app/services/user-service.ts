import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { Observable, throwError } from 'rxjs'
import { LogInData } from '../models/logInRequest';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {


  public logInUser(userName: string, password: string): Observable<User>{
    const logInUrl: string = 'loginUrl';
    const logInData: LogInData =  {
      ... new LogInData(),
      userName: userName,
      passWord: password
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'auth-token' //TODO pogruntat authorization za na server na kak način
      })
    };
    //* nastavljanje auth tokena httpOptions.headers = httpOptions.headers.set('Authorization', 'my-new-auth-token');

    return this.http.post<User>(logInUrl, logInData, httpOptions)
    .pipe(
      tap(us => {
        if(us != null)
          this.userSuccessfullyLoggedIn(us);
      }),
      catchError(er => this.handleError(er)),
    );
  }




  constructor(private http: HttpClient) { }

  private userSuccessfullyLoggedIn(user: User){
    console.log('userSuccessfullyLoggedIn');
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

}