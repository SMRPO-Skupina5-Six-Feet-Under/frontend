import { Component } from '@angular/core';
import { tap } from 'rxjs';
import { User } from './models/user';
import { AuthService } from './services/auth.service';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'G5-Scrum';

  isUserLoggedIn: boolean = false;
  loggedInUserName: string = "johnDoe";
  isAdmin: boolean = false;


  logout(){
    this.loginService.logout();
  }
  
  constructor (
    private loginService: LoginService,
    private authService: AuthService
  )
  {
    this.checkIfUserIsLoggedIn();
  }


  private checkIfUserIsLoggedIn(){
    console.log('Checking if user is logged in...');
    this.loginService.checkIfUserIsLoggedIn();
    this.loginService.loggedInUser$.pipe(
      tap((user:User) => {
        if(user){
          this.isUserLoggedIn = true;
          this.loggedInUserName = user.userName;
          this.isAdmin = user.isAdmin;
        }
        else
          this.isUserLoggedIn = false;
      })
    ).subscribe()
  }

  //TODO: set isAdmin variable
  private setAdmin(){
    if(this.isUserLoggedIn){
      
    }
  }
}
