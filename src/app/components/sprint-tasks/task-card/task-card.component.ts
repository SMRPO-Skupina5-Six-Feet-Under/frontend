import { Component, EventEmitter, Input, Output } from '@angular/core';
import { take, tap } from 'rxjs';
import { Task } from 'src/app/models/task';
import { User } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';

//! komponenta 
@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  @Output() taskUpdated = new EventEmitter<Task>();
  
  private _task: Task;
  @Input() set task(value: Task){
    if(!value) return;

    this._task = value;	
  
  }

  get task(): Task{
    return this._task;
  }
  //--------------end of inputs
  currentUserId: number;

  acceptTask(){
    //TODO accept and emmit event
  }

  declineTask(){
    //TODO decline and emmit event
  }

  editTask(){
    //TODO edit and emmit event 
  }


  constructor(
    private loginService: LoginService
  ) { 
    this.setCurrentUserId();

  }

  private setCurrentUserId(){
    this.loginService.loggedInUser$.pipe(
      tap((user: User) => {
        if(user == null) return;
        this.currentUserId = user.id;
      }),
      take(1)
    ).subscribe();
  }


}
