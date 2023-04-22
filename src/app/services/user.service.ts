import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators'; 
import { BehaviorSubject, Observable } from 'rxjs';
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

  allUsers$: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  getAllUsers(): Observable<User[]> {
    const url = "users"
    return this.http.get<User[]>(url)
      .pipe(
        map((res: User[]) => res.sort((a, b) => a.id - b.id)),
        tap((res: User[]) => this.allUsers$.next(res)),
        tap(() => console.log("Users loaded")),
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

  deleteUser(userId: number): Observable<User>{
    const endpoint = `users/${userId}`;
    
    return this.http.delete<User>(endpoint).pipe(
      tap(() => this.toastr.success("User deleted successfully")),
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }

  editUser(user: User): Observable<User>{
    const endpoint = `users/${user.id}`;
    return this.http.put<User>(endpoint, user).pipe(
      tap(() => this.toastr.success("User updated successfully")),
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }

}