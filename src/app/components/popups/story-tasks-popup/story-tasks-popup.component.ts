import { Component, EventEmitter, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, tap } from 'rxjs';
import { Project } from 'src/app/models/project';
import { Story } from 'src/app/models/story';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-story-tasks-popup',
  templateUrl: './story-tasks-popup.component.html',
  styleUrls: ['./story-tasks-popup.component.scss']
})
export class StoryTasksPopupComponent {


  @Output() storyTasksSaved: EventEmitter<Story> = new EventEmitter<Story>();

  //--------------end of inputs
  visible: boolean = false;
  storyTasks: Task[] = [];
  story: Story;
  triggerReload: boolean = false;

  projectDevelopers: {id: number, fullName: string}[] = [];


  display(story: Story, project: Project){
    this.storyTasks = [];
    this.triggerReload = false;
    this.story = JSON.parse(JSON.stringify(story));
    if(this.story != null){
      this.loadStoryTasks();
      this.projectDevelopers = project.developerFullNamesIds;
      this.visible = true;
    }
    else
      console.error("Story is null");
  }

  save(){
    const dataOK: boolean = this.checkData();
    if(!dataOK)
      return;
    else{
      forkJoin(
        this.storyTasks.filter(st => !st.isFinished).map(st => this.taskService.saveTask(st))
      ).pipe(
        tap(savedTasks => {
          this.storyTasksSaved.emit(this.story);
          this.visible = false;
        })
      ).subscribe();
    }
  }

  close(){
    this.visible = false;
    if(this.triggerReload)
      this.storyTasksSaved.emit(this.story);
  }

  addTask(){
    const task: Task = {
      ... new Task(),
      storyId: this.story.id
    };
    this.storyTasks.push(task);
  }

  deleteTask(task: Task, index: number){
    if(task.id){
      this.taskService.deleteTask(task.id).pipe(
        tap(deletedTask => {
          this.storyTasks.splice(index, 1);
          this.triggerReload = true;
        })
      ).subscribe();
      
    } else {
      this.storyTasks.splice(index, 1);
    }
  }


  constructor(private toastr: ToastrService,
    private taskService: TaskService
    ) { 

  }


  private checkData(): boolean{
    if(this.storyTasks.length == 0) return false;
    for (let i = 0; i < this.storyTasks.length; i++) {
      const st = this.storyTasks[i];
      st.description = st.description?.trim();
      if(st.description == null || st.description === ''){
        this.toastr.warning('Description is required ', 'Warning');
        return false
      }
      if(st.timeEstimate == null ){
        this.toastr.warning('Time estimate is required', 'Warning');
        return false
      }
      if(st.timeEstimate <= 0){
        this.toastr.warning('Time estimate must be greater than 0', 'Warning');
        return false
      }
    }
    return true;
  }


  private loadStoryTasks(){
    if(this.story != null){
      this.taskService.loadStoryTasks(this.story.id).pipe(
        tap(tasks => this.storyTasks = tasks)
      ).subscribe();
    }
  }
}
