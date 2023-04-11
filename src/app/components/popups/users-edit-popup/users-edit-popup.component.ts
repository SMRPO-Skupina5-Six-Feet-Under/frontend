import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { filter, tap } from 'rxjs';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { ChangePasswordPopupComponent } from '../change-password-popup/change-password-popup.component';


@Component({
  selector: 'app-users-edit-popup',
  templateUrl: './users-edit-popup.component.html',
  styleUrls: ['./users-edit-popup.component.scss']
})
export class UsersEditPopupComponent {
  @Output() userSaved: EventEmitter<User> = new EventEmitter<User>();

  user: User;
  visible: boolean = false;
  newPassword: string;
  newPassword2: string;

  display(user: User){
    this.user = JSON.parse(JSON.stringify(user));
    if(this.user != null){
      /*
      if(this.sprint.startDate != null)
        this.startDate = this.datePipe.transform(this.sprint.startDate, 'yyyy-MM-dd');
      if(this.sprint.endDate != null)
        this.endDate = this.datePipe.transform(this.sprint.endDate, 'yyyy-MM-dd');
      */

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
      this.userService.editUser(JSON.parse(JSON.stringify(this.user))).pipe(
        filter(ss => ss != null),
        tap(savedUser => {
          this.userSaved.emit(savedUser);
          this.visible = false;
        })
      ).subscribe();
    }
  }

  changePassword(){
    this.changePasswordPopup.display(JSON.parse(JSON.stringify(this.user)));
  }

  private checkData(): boolean{
    if(this.user.userName.length == 0 || this.user.firstName.length == 0 || this.user.lastName.length == 0 || this.user.email.length == 0){
      this.toastr.warning('Please fill all fields.', 'Warning');
      return false;
    }
    return true;
  }



  @ViewChild(ChangePasswordPopupComponent) changePasswordPopup: ChangePasswordPopupComponent;
  constructor(
    private toastr: ToastrService,
    private userService: UserService,
    private datePipe: DatePipe
  ){

  }
}
