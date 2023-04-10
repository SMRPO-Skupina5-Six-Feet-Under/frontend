import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { filter, tap } from 'rxjs';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-change-password-popup',
  templateUrl: './change-password-popup.component.html',
  styleUrls: ['./change-password-popup.component.scss']
})
export class ChangePasswordPopupComponent {

  user: User;
  visible: boolean = false;
  newPassword: string = '';
  newPassword2: string = '';
  showPwd: boolean = false

  display(user: User){
    this.user = JSON.parse(JSON.stringify(user));
    if(this.user != null){
      this.visible = true;
    }
    else
      console.error("User is null");
  }

  close(){
    this.visible = false;
  }

  save(){
    const dataOK: boolean = this.checkData();
    if(!dataOK)
      return;
    else{
      this.userService.changePassword(this.user.id, this.newPassword).pipe(
        tap((user: User) => {
          this.newPassword = '';
          this.newPassword2 = '';
          this.visible = false;
        })
      ).subscribe();
    }
  }

  private checkData(): boolean{
    if(this.newPassword.length == 0 || this.newPassword2.length == 0){
      this.toastr.warning('Please fill all fields.', 'Warning');
      return false;
    }
    if(this.newPassword.length > 128 || this.newPassword.length < 12){
      this.toastr.warning('Password must be between 12 and 128 characters long.', 'Warning');
      return false;
    }
    if(this.newPassword !== this.newPassword2){
      this.toastr.warning('Passwords must match.', 'Warning');
      return false;
    }
    return true
  }


  constructor(
    private toastr: ToastrService,
    private userService: UserService,
    private datePipe: DatePipe
  ){

  }
}