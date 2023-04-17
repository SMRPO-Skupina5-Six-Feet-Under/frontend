import { Component, EventEmitter, Input, Output } from '@angular/core';
import { tap } from 'rxjs';
import { Project } from 'src/app/models/project';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-task-popup',
  templateUrl: './task-popup.component.html',
  styleUrls: ['./task-popup.component.scss']
})
export class TaskPopupComponent {
  private _task: Task;
  @Input() set task(value: Task){
    if(!value) return;

    this._task = value;
  }
  get task(): Task{
    return this._task;
  }

  @Output() taskSaved: EventEmitter<Task> = new EventEmitter<Task>();
  //-- end of input/output
  visible: boolean = false;
  projectDevelopers: {id: number, fullName: string}[] = [];


  display(task: Task, project: Project){
    if(task == null) return;
    
    this.task = JSON.parse(JSON.stringify(task)); //depp copy
    this.projectDevelopers = project.developerFullNamesIds;
    this.visible = true;

  }


  save(){
    this.taskService.saveTask(this.task).pipe(
      tap((editedTask: Task) => this.taskSaved.emit(editedTask))
    ).subscribe();
  }

  close(){
    this.visible = false;
  }



  constructor(
    private taskService: TaskService,
  ) { }



}
