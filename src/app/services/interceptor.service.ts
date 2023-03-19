import { Injectable } from '@angular/core'; 
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { Router } from '@angular/router'; 
import { AuthService } from './auth.service'; 
 
@Injectable({ 
  providedIn: 'root' 
}) 
export class InterceptorService implements HttpInterceptor { 
  private baseURL = 'http://localhost:8003/';


   //  const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     Authorization: 'auth-token' //TODO pogruntat authorization za na server na kak način
    //   })
    // };
    // return this.http.post<User>(logInUrl, logInData, httpOptions)

  constructor( 
    private router: Router, 
    private auth: AuthService 
  ) { 
  } 
 
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> { 
    request = request.clone({ url: `${this.baseURL}${request.url}` }); //* base url
    if (!request.headers.has('Content-Type')) 
      request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') }); 
    
    request = request.clone({ headers: request.headers.set('Accept', 'application/json') }).clone({ 
      setHeaders: { 
        Authorization: `Bearer ${this.auth.getAuthToken()}` 
      } 
    });     
 
    

    return next.handle(request) 
  } 
}