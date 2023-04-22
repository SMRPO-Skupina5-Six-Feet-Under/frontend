import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { take, tap } from 'rxjs';
import { Task } from 'src/app/models/task';
import { User } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';
import { TaskService } from 'src/app/services/task.service';
import { TaskPopupComponent } from '../../popups/task-popup/task-popup.component';
import { Project } from 'src/app/models/project';

//! komponenta 
@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<Task>();
  
  private _task: Task;
  @Input() set task(value: Task){
    if(!value) return;

    this._task = value;	
  
  }

  get task(): Task{
    return this._task;
  }

  @Input() project: Project;
  @Input() showStartStop: boolean = false;
  //--------------end of inputs
  currentUserId: number;

  acceptTask(){
    console.log('accepted task', this.task);
    this.taskService.acceptTask(this.task).pipe(
      tap((editedTask: Task) => this.taskEdited(editedTask))
    ).subscribe();
  }

  declineTask(){
    console.log('declined task', this.task);
    this.taskService.declineTask(this.task).pipe(
      tap((editedTask: Task) => this.taskEdited(editedTask))
    ).subscribe();
  }

  editTask(){
    this.taskPopup.display(this.task, this.project);
  }

  deleteTask(){
    this.taskService.deleteTask(this.task.id).pipe(
      tap((deletedTask: Task) => this.taskDeleted.emit(deletedTask))
    ).subscribe();
  }

  taskEdited(task: Task){
    this.taskUpdated.emit(task);
  }

  startTask(){
    this.taskService.startTask(this.task).pipe(
      tap((startedTask: Task) => this.taskEdited(startedTask))
    ).subscribe();
  }

  stopTask(){
    this.taskService.stopTask(this.task).pipe(
      tap(() => this.taskEdited(this.task))
    ).subscribe();
  }

  @ViewChild(TaskPopupComponent) taskPopup: TaskPopupComponent;
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
