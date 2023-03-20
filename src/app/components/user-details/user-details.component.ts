import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';
import { User } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {
  user: User/*  = {
    ... new User,
    userName: 'johnDoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    isAdmin: true,
    password: 'examplePassword',
    permissions: '',
    lastLogin: new Date(1988, 3, 15),
  } */;

  oldPassword: string;
  newPassword: string;
  newPassword2: string;


  passReveal(){
    console.log("reveal password");
  }
  
  passRevealLast(){
    console.log("reveal password");
  }

  changePassword(){
    if(this.user?.id){
      if(!this.oldPassword || !this.newPassword || !this.newPassword2)
        this.toastr.warning('Please fill all fields!', 'Warning');
      else if(this.newPassword.length > 128 || this.newPassword.length < 12)
        this.toastr.warning('Password must be between 12 and 128 characters long!', 'Warning');
      else if( this.newPassword !== this.newPassword2)
        this.toastr.warning('New passwords do not match!', 'Warning');
      else if( this.oldPassword !== this.user.password)
        this.toastr.warning('Current password incorrect!', 'Warning');
      else
        this.userService.changePassword(this.user.id, this.newPassword).pipe(
          tap((user: User) => {
            this.oldPassword = '';
            this.newPassword = '';
            this.newPassword2 = '';
            const cancelPassChangeButton = document.getElementById('cancelPassChangeButton');
            cancelPassChangeButton.click();

          })
        ).subscribe();
    } else
      this.toastr.error('User not logged in!', 'Error');
  }

  saveUser(){
    //TODO save user
    this.toastr.success('User saved successfully', 'Success');
    console.log(JSON.stringify(this.user));
  }


  constructor(
    private toastr: ToastrService,
    private router: Router,
    private loginService: LoginService,
    private userService: UserService,
  ){
    this.testIfUserIsLoggedIn();
  }


  private testIfUserIsLoggedIn(){
    this.loginService.loggedInUser$.pipe(
      tap((user: User) => {
        if(user)
          this.user = user;
        else
          this.router.navigate(['/login']);
      })
    ).subscribe();
  }

}
