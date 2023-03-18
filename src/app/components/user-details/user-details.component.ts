import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';
import { User } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';

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
    if(!this.oldPassword || !this.newPassword || !this.newPassword2)
      this.toastr.warning('Please fill all fields!', 'Warning');
    else if(this.newPassword.length > 128 || this.newPassword.length < 12)
      this.toastr.warning('Password must be between 12 and 128 characters long!', 'Warning');
    else if( this.newPassword !== this.newPassword2)
      this.toastr.warning('New passwords do not match!', 'Warning');
    else{
      //TODO vse ok - pošlji zahtevek na server
    }

  }

  saveUser(){
    //TODO save user
    this.toastr.success('User saved successfully', 'Success');
    console.log(JSON.stringify(this.user));
  }


  constructor(
    private toastr: ToastrService,
    private router: Router,
    private loginService: LoginService
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
