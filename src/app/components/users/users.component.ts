import { HttpResponse } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { NgForm, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { from, take, tap } from 'rxjs';
import { User, UserCreate } from 'src/app/models/user';
import { UsersEditPopupComponent } from '../popups/users-edit-popup/users-edit-popup.component';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';

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
  }  
  users: User[] = []
  showPwd: boolean = false
  passwordRetype: string = ''

  @ViewChild(UsersEditPopupComponent) userPopup: UsersEditPopupComponent;
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private loginService: LoginService,
    private userService: UserService,
    private authService: AuthService
  ){
    this.testIfUserIsLoggedIn();
  }

  private testIfUserIsLoggedIn(){
    this.loginService.loggedInUser$.pipe(
      tap((user: User) => {
        if(user)
          if(user.isAdmin){
            this.user = user;
            this.getAllUsers();
          }else{
            this.toastr.error('Only admin can access this tab.', 'Error');
            this.router.navigate(['/user_details'])
          }
        else
          this.router.navigate(['/login']);
      }),
      take(1)
    ).subscribe();
  }

  private getAllUsers(){
    this.userService.getAllUsers().subscribe(users => this.users = users.filter(x => !x.userDeleted));
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
    if(this.newUser.password !== this.passwordRetype){
      this.toastr.warning('Passwords must match.', 'Warning');
      return;
    }

    this.newUser.userName = this.newUser.userName.trim();
    this.newUser.firstName = this.newUser.firstName.trim();
    this.newUser.lastName = this.newUser.lastName.trim();
    this.newUser.email = this.newUser.email.trim();
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

  editUser(user: User){
    this.userPopup.display(JSON.parse(JSON.stringify(user)));
  }

  userSaved(user: User){
    const userIndex = this.users.findIndex(u => u.id === user.id);
    //if logged in user was updated, set updated user in loggedInUser and set token and if admin privileges were removed, refresh window
    if(user.id == this.user.id){
      if(user.userName !== this.user.userName){
        this.loginService.logout();
      }else{
        this.loginService.loggedInUser$.next(user);
        this.authService.setUserToken(user);
        if(!user.isAdmin){
          window.location.reload();
        }
      }
    }
    if(userIndex === -1)
      this.users.push(user);
    else
      this.users[userIndex] = user;
  }

  private _deleteUserIndex: number;
  deleteUser(userIndex: number){
    console.log("deleteUser ", userIndex);
    const openConfirmDeleteBtn = document.getElementById('#openConfirmDeleteModal');
    openConfirmDeleteBtn.click();
    this._deleteUserIndex = userIndex;
  }

  confirmedDeleteUser(){
    console.log("confirmedDeleteUser ", this._deleteUserIndex);
    if(this._deleteUserIndex != null){
      const user = this.users[this._deleteUserIndex];
      if(user)
        this.userService.deleteUser(user.id).pipe(
          tap(() => {
            //this.users[this._deleteUserIndex].userDeleted = true;
            this.users.splice(this._deleteUserIndex, 1);
            //close modal
            const btn = document.getElementById('closeDelUserConfirmation');
            btn.click();
          })
        ).subscribe();
    }
  }

  clearNewUserModal(){
    this.newUser = new UserCreate();
    this.showPwd = false;
    this.passwordRetype = '';
  }
}
