import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators'; 
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { User, UserCreate } from '../models/user';
import { AuthService } from './auth.service';
import { LoginService } from './login.service';
import { HandleErrorService } from './handler-error.service';



@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient,
    private toastr: ToastrService,
    private authService: AuthService,
    private loginService: LoginService,
    private handleErrorService: HandleErrorService
    ) { }

  getAllUsers(): Observable<User[]> {
    const url = "users"
    return this.http.get<User[]>(url)
      .pipe(
        catchError(er => this.handleErrorService.handleError(er))
      );
  }

  addNewUser(newUser: UserCreate): Observable<User>{
    const url = "users"
    return this.http.post<User>(url, newUser)
      .pipe(
        catchError(er => this.handleErrorService.handleError(er))
      );
  }

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
      catchError(er => this.handleErrorService.handleError(er)),
    );
  }

}