import { Component, Input } from '@angular/core';
import { forkJoin, take, tap } from 'rxjs';
import { Project } from 'src/app/models/project';
import { Sprint } from 'src/app/models/sprint';
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

  @Input() project: Project;
  @Input() activeSprint: Sprint;

  //--------------end of inputs

  unassignedTasks: Task[] = [];
  assignedTasks: Task [] = [];
  activeTasks: Task[] = [];
  finishedTasks:Task [] = [];


  taskUpdated(task: Task){
    this.loadSprintTasks();
  }

  taskDeleted(task: Task){
    const unassignedTasksIndex = this.unassignedTasks.findIndex(t => t.id === task.id);
    if(unassignedTasksIndex > -1){
      this.unassignedTasks.splice(unassignedTasksIndex, 1);
      return;
    }
  }

  constructor(
    private taskService: TaskService,
  ) { 

  }



  private loadSprintTasks(){
    if(this.sprintStories != null && this.sprintStories.length > 0){
      forkJoin(this.sprintStories.map(ss => 
        this.taskService.loadStoryTasks(ss.id)
        .pipe(tap(tasks => console.log("tasks ", tasks)),take(1))
        )
      ).pipe(
        tap((tasks: Task[][]) => {
          console.log("sprint tasks ", tasks);
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
      if(task.isDone){
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
