import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { Observable, of, throwError } from 'rxjs'
import { LogInData } from '../models/logInData';
import { catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {


  changePassword(userId: number, newPassword: string): Observable<User>{
    const url = `users/${userId}/change-password`;
    return this.http.post<User>(url, {newPassword: newPassword}).pipe(
      tap((res: User) => {
        if(res != null){
          this.toastr.success('Password successfully changed');
          this.authService.setUserToken(res);
          this.loginService.loggedInUser$.next(res);
        }
      }),
      catchError(er => this.handleError(er)),
    );
  }


  constructor(private http: HttpClient,
    private toastr: ToastrService,
    private authService: AuthService,
    private loginService: LoginService
    ) { 

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