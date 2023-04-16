import { Component, Input } from '@angular/core';
import { forkJoin, tap } from 'rxjs';
import { Story } from 'src/app/models/story';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-sprint-tasks',
  templateUrl: './sprint-tasks.component.html',
  styleUrls: ['./sprint-tasks.component.scss']
})
export class SprintTasksComponent {
  private _sprintStories: Story[];
  @Input() set sprintStories(value: Story[]){
    if(!value) return;

    this._sprintStories = value;	
    this.loadSprintTasks();
  }

  get sprintStories(): Story[]{
    return this._sprintStories;
  }

  //--------------end of inputs

  unassignedTasks: Task[] = [];
  assignedTasks: Task [] = [];
  activeTasks: Task[] = [];
  finishedTasks:Task [] = [];


  taskUpdated(task: Task){

  }

  constructor(
    private taskService: TaskService,
  ) { 

  }



  private loadSprintTasks(){
    if(this.sprintStories != null && this.sprintStories.length > 0){
      forkJoin(this.sprintStories.map(ss => 
        this.taskService.loadStoryTasks(ss.id))
      ).pipe(
        tap((tasks: Task[][]) => {
          this.divideAdnAssignTasksByStatus(tasks.reduce((acc, val) => acc.concat(val), []).sort((a, b) => a.id - b.id));
          console.log('sprint tasks ', this.sprintStories);
        })
      ).subscribe()
    }
  }


  private divideAdnAssignTasksByStatus(tasks: Task[]){
    if(tasks == null) return;

    this.unassignedTasks = [];
    this.assignedTasks = [];
    this.activeTasks = [];
    this.finishedTasks = [];
    for (const task of tasks) {
      if(task.isFinished){
        this.finishedTasks.push(task);
        continue;
      }
      if(task.isActive){
        this.activeTasks.push(task);
        continue;
      }
      if(task.hasAssigneeConfirmed){
        this.assignedTasks.push(task);
        continue;
      }
      //any other task
      this.unassignedTasks.push(task);
    }
  }


}
