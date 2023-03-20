import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { from, tap } from 'rxjs';
import { User, UserCreate } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  user: User
  //newUser: UserCreate 
  newUser: UserCreate  = {
    ... new UserCreate,
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    isAdmin: false,
    password: '',
    permissions: '',
  }  
  users: User[] = []

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private loginService: LoginService,
    private userService: UserService
  ){
    this.testIfUserIsLoggedIn();
    this.getAllUsers();
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

  private getAllUsers(){
    this.userService.getAllUsers().subscribe(users => this.users = users);
    /*
    this.userService.getAllUsers().pipe(
      tap((users: User[]) => {
        console.log(users);
      })
    ).subscribe();
    */
  }

  addNewUser(){
    //validation
    if(this.newUser.userName.length == 0 || this.newUser.firstName.length == 0 || this.newUser.lastName.length == 0 ||
      this.newUser.email.length == 0 || this.newUser.password.length == 0){
      this.toastr.warning('Please fill all fields.', 'Warning');
      return;
    }
    if(this.newUser.password.length > 128 || this.newUser.password.length < 12){
      this.toastr.warning('Password must be between 12 and 128 characters long.', 'Warning');
      return;
    }

    this.newUser.userName = this.newUser.userName.trim();
    this.newUser.firstName = this.newUser.firstName.trim();
    this.newUser.lastName = this.newUser.lastName.trim();
    this.newUser.email = this.newUser.email.trim();
    if(this.newUser.permissions != null && this.newUser.permissions.length == 0){
      this.newUser.permissions = null;
    }
   let data = this.userService.addNewUser(this.newUser).pipe(
    tap((user: User) => {
      if(user){
        this.users.push(user);
        this.toastr.success('New user successfully added.', 'Success');
        const newUserModalCancelButton = document.getElementById('newUserModalCancelButton');
        newUserModalCancelButton.click();
      }
      else{
        this.toastr.error('Something went wrong while adding user, please try again,', 'Error');
      }
    })
   ).subscribe();
   /*.subscribe(usr => {
    this.toastr.success('New user successfully added.', 'Success');
    this.users.push(usr);
  });*/
  }
}
