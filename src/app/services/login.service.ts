import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { catchError, tap } from 'rxjs/operators'; 
import { BehaviorSubject } from 'rxjs';
import { LogInData, LogInResponse } from '../models/logInData';
import { AuthService } from './auth.service';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { HandleErrorService } from './handler-error.service';
 

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  loggedInUser$: BehaviorSubject<User> = new BehaviorSubject<User>(null); // behaviour subject je observable, ki ima default vrednost, vsakic ko se vrednost spremeni se pošlje vsem ki so subscribani nanj ta nova vrednost
 
  login(payload: LogInData) { 
    const url = 'login';
    
    return this.httpClient.post<LogInResponse>(url, payload).pipe(
      tap((res: LogInResponse) => {
        if(res != null){
          this.authService.setAuthToken(res.access_token);
          this.authService.setUserToken(res.user);
          this.loggedInUser$.next(res.user);
        }
      }),
      catchError(er => this.handleErrorService.handleError(er)),
      ); 
  } 
 
 

  checkIfUserIsLoggedIn(): boolean{
    const token: string = this.authService.getAuthToken();
    const userStr: string = this.authService.getUserToken();
    if(token != null && userStr != null){
      this.loggedInUser$.next(JSON.parse(userStr));
      return true;
    }else return false;
  }

  getLoggedInUser(): User{
    const usrStr = this.authService.getUserToken();
    if(usrStr != null){
      const userObject: User = JSON.parse(usrStr);
      return userObject;
    } else return null;
  }

  logout(){
    this.authService.removeAuthToken();
    this.authService.removeUserToken();
    this.loggedInUser$.next(null);
    this.router.navigate(['/login']);
  }
  

  constructor(private httpClient: HttpClient,
    private authService: AuthService,
    private router: Router,
    private handleErrorService: HandleErrorService,
    ) { } 


}
