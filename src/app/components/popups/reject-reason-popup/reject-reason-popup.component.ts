import { Component, EventEmitter, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reject-reason-popup',
  templateUrl: './reject-reason-popup.component.html',
  styleUrls: ['./reject-reason-popup.component.scss']
})
export class RejectReasonPopupComponent {
  @Output() reason: EventEmitter<string> = new EventEmitter<string>();

  visible: boolean = false;
  rejectReason: string = '';

  display(){
    this.visible = true;
    this.rejectReason = '';
  }

  sendRejectReason(){
    this.rejectReason = this.rejectReason.trim();
    if(this.rejectReason.length === 0){
      this.toastr.warning("Please enter reject reason");
      return;
    }
    this.reason.emit(this.rejectReason);
    this.visible = false;
  }


  close(){
    this.visible = false;
  }

  constructor(
    private toastr: ToastrService
  ) { }
}
