import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'; 
import { catchError, map, tap } from 'rxjs/operators'; 
import { BehaviorSubject, of, throwError } from 'rxjs';
import { LogInData, LogInResponse } from '../models/logInData';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';
import { User } from '../models/user';
 

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private REST_API_SERVER = "http://localhost:8003/"; // najt nacin da to daš generic

  loggedInUser$: BehaviorSubject<User> = new BehaviorSubject<User>(null); // behaviour subject je observable, ki ima default vrednost, vsakic ko se vrednost spremeni se pošlje vsem ki so subscribani nanj ta nova vrednost

  // baseHref: string = location.origin;
  // console.log(location);
    
  // location.host => barebones IP 
  // origin => http:// +IP
  // tk da pol na " origin + /product-catalog/ " posiljat zahtevke na endpointe

  getTypeRequest(url: string) { 
    return this.httpClient.get(this.REST_API_SERVER+url).pipe(map(res => { 
      return res; 
    })); 
  } 
 
  login(payload: LogInData) { 
    const url = 'login';
    //  const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     Authorization: 'auth-token' //TODO pogruntat authorization za na server na kak način
    //   })
    // };
    // return this.http.post<User>(logInUrl, logInData, httpOptions)
    return this.httpClient.post<LogInResponse>(this.REST_API_SERVER + url, payload).pipe(
      tap((res: LogInResponse) => {
        if(res != null){
          this.authService.setAuthToken(res.token);
          this.authService.setUserToken(res.user);
          this.loggedInUser$.next(res.user);
        }
      }),
      catchError(er => this.handleError(er)),
      ); 
  } 
 
  putTypeRequest(url: string, payload: any) { 
    return this.httpClient.put(this.REST_API_SERVER+url, payload).pipe(map(res => { 
      return res; 
    })) 
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
  }
  

  constructor(private httpClient: HttpClient,
    private toastr: ToastrService,
    private authService: AuthService
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
