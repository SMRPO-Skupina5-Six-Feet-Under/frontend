import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take, tap } from 'rxjs/operators';
import { LogInData, LogInResponse } from 'src/app/models/logInData';
import { User } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  userName: string='';
  password: string='';

  displayPass: boolean = false;

  logIn(){
    this.password = this.password;
    this.userName = this.userName.trim();    
    // console.log('UserName: ',this.userName,'  Pass: ',this.password);
    if(this.userName && this.password){
      const logInData: LogInData = {
        ... new LogInData,
        userName: this.userName,
        password: this.password
      };
      this.loginService.login(logInData).pipe(
        tap((response: LogInResponse) => {
          console.log(response);
          if(response){
            this.router.navigate(['/user_details']); //? preusmeri na details --> opcijsko preusmeri na nek board ali pa home (kjer so prikazani vsi board)
            if(response.user.lastLogin){
              const dateString: string = this.datePipe.transform(response.user.lastLogin, 'dd.MM.yyyy HH:mm:ss','+0200');
              this.toastr.info('Last login: ' + dateString, 'Welcome back! '+ response.user?.userName,{disableTimeOut: true });
            }
            else
              this.toastr.info('First login!', 'Welcome! ' + response.user?.userName, {disableTimeOut: true });
          }
            //TODO preusmeri na pogled vseh boardov / projektov?
        }),
        take(1)
      ).subscribe();
    } else
      this.toastr.warning('Please enter username and password!', 'Missing data',)
  }


  constructor(
    private loginService: LoginService,
    private router: Router,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ){
    this.loginService.loggedInUser$
    .pipe(
      tap((user: User) => {
        if(user)
          this.router.navigate(['/user_details']);
      }),
      take(1)
    ).subscribe();
  }
}
