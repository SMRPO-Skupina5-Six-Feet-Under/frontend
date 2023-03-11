import { Component } from '@angular/core';
import { take } from 'rxjs/operators';
import { UserService } from 'src/app/services/user-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  userName: string="";
  password: string="";

  logIn(){
    console.log('UserName: ',this.userName,'  Pass: ',this.password);
    if(this.userName && this.password)
      this.userService.logInUser(this.userName, this.password)
        .pipe(take(1));
  }


  constructor(
    private userService: UserService
  ){

  }

}
