import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { take, tap } from 'rxjs';
import { Task } from 'src/app/models/task';
import { User } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';
import { TaskService } from 'src/app/services/task.service';
import { TaskPopupComponent } from '../../popups/task-popup/task-popup.component';
import { Project } from 'src/app/models/project';
import { UserTaskWorktimesPopupComponent } from '../../popups/user-task-worktimes-popup/user-task-worktimes-popup.component';
import { Sprint } from 'src/app/models/sprint';

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
    this.setPermissions();
  }

  get task(): Task{
    return this._task;
  }

  @Input() project: Project;
  @Input() showStartStop: boolean = false;
  @Input() activeSprint: Sprint
  //--------------end of inputs
  currentUserId: number;
  taskIsAccepted: boolean = false;
  taskIsForCurrentUser: boolean = false;

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

  //#region Times
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

  showMyTimes(){
    this.userTaskWorktimes.display(this.task, this.activeSprint, this.currentUserId);
    //TODO check for correctness
  }

  //#endregion

  @ViewChild(UserTaskWorktimesPopupComponent) userTaskWorktimes: UserTaskWorktimesPopupComponent;
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
        this.setPermissions();
      }),
      take(1)
    ).subscribe();
  }


  private setPermissions(){
    if(this.task && this.currentUserId){
      this.taskIsForCurrentUser = this.task.assigneeUserId === this.currentUserId;
    }
  }


}
