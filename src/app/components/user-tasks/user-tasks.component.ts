import { InvokeFunctionExpr } from '@angular/compiler';
import { Component, Input } from '@angular/core';
import { tap } from 'rxjs';
import { Project } from 'src/app/models/project';
import { Sprint } from 'src/app/models/sprint';
import { Task } from 'src/app/models/task';
import { User } from 'src/app/models/user';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-user-tasks',
  templateUrl: './user-tasks.component.html',
  styleUrls: ['./user-tasks.component.scss']
})
export class UserTasksComponent {
  //#region inputs/outputs
  private _currentUser: User;
  @Input() set currentUser(value: User) {
    if(!value) return;
    this._currentUser = value;
    
    this.loadSprintUserTasks();
  }
  public get currentUser(): User {
    return this._currentUser;
  }

  private _activeSprint: Sprint;
  @Input() set activeSprint(value: Sprint) {
    if(value == null) return;
    this._activeSprint = value;
    this.loadSprintUserTasks();
  }
  public get activeSprint(): Sprint {
    return this._activeSprint;
  }

  @Input() project: Project;
  //#endregion
  userTasks: Task[] = [];

  taskUpdated(task: Task){
    this.loadSprintUserTasks();
  }

  constructor(
    private taskService: TaskService
  ) { }



  private loadSprintUserTasks(){
    if(!this.currentUser || !this.activeSprint) return;
    
    this.taskService.loadTasksForActiveSprintUser
    (this.activeSprint, this.currentUser).pipe(
      tap((tasks: Task[]) => {
        console.log("userTasksLoaded: ", tasks);
        this.userTasks = tasks;
        const activeTaskIndex = this.userTasks.findIndex(t => t.isActive);
        if(activeTaskIndex !== -1)
          this.userTasks.unshift(this.userTasks.splice(activeTaskIndex, 1)[0]);
      })).subscribe()
  }
}
