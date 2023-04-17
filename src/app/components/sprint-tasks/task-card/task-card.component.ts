import { Component, EventEmitter, Input, Output } from '@angular/core';
import { take, tap } from 'rxjs';
import { Task } from 'src/app/models/task';
import { User } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';
import { TaskService } from 'src/app/services/task.service';

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
    console.log('accepted task', this.task);
    this.taskService.acceptTask(this.task).pipe(
      tap(() => this.taskUpdated.emit(this.task))
    ).subscribe();
  }

  declineTask(){
    console.log('declined task', this.task);
    this.taskService.declineTask(this.task).pipe(
      tap(() => this.taskUpdated.emit(this.task))
    ).subscribe();
  }

  editTask(){
    //TODO edit and emmit event 
  }


  constructor(
    private loginService: LoginService,
    private taskService: TaskService
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
