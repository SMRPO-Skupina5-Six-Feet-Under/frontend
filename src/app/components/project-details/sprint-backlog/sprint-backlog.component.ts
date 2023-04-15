import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, take, tap } from 'rxjs';
import { Project } from 'src/app/models/project';
import { Sprint } from 'src/app/models/sprint';
import { Story } from 'src/app/models/story';
import { Task } from 'src/app/models/task';
import { User } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';
import { StoryService } from 'src/app/services/story.service';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-sprint-backlog',
  templateUrl: './sprint-backlog.component.html',
  styleUrls: ['./sprint-backlog.component.scss']
})
export class SprintBacklogComponent {
  private _project: Project;
  @Input() set project(project: Project){
    if(!project) return;

    if(this.project != project){
      this._project = project;
  
      if(this.project != null && this.activeSprint != null){
        this.loadSprintStories();
      }
    }
  }
  get project(): Project{
    return this._project;
  }

  private _activeSprint: Sprint;
  @Input() set activeSprint(sprint: Sprint){
    if(!sprint) return;

    if(this.activeSprint != sprint){
      this._activeSprint = sprint;	
  
      if(this.project != null && this.activeSprint != null){
        this.loadSprintStories();
      }
    }
  }
  get activeSprint(): Sprint{
    return this._activeSprint;
  }


  //--------------end of inputs
  currentUser: User;
  displayingStories: boolean = true;
  displayingTasks: boolean = false;
  sprintStories: Story[] = [];
  sprintTasks: Task[] = [];

  toggleDisplay(){
    this.displayingStories = !this.displayingStories;
    this.displayingTasks = !this.displayingTasks;
  }


  userStoryEdited(story: Story){
    this.loadSprintStories();
  }


  constructor( private loginService: LoginService,
    private storyService: StoryService,
    private taskService: TaskService,
    private router: Router,
  ) {
    this.setCurrentUser();    
  }

  private setCurrentUser(){
    this.loginService.loggedInUser$.pipe(
      tap(user => {
        this.currentUser = user
        if(this.currentUser == null) this.router.navigate(['/login']);
      }),
      take(1)
    ).subscribe();
  }

  private loadSprintStories(){
    if(this.project != null && this.activeSprint != null){
      this.storyService.loadProjectStories(this.project.id).pipe(
        tap((stories: Story[]) =>{ 
          this.sprintStories = stories.filter(s => s.sprint_id === this.activeSprint.id);
          this.loadSprintTasks(this.sprintStories);
        })
      ).subscribe();
    }
  }

  private loadSprintTasks(sprintStories: Story[]){
    if(sprintStories != null && sprintStories.length > 0){
      forkJoin(sprintStories.map(ss => 
        this.taskService.loadStoryTasks(ss.id))
      ).pipe(
        tap((tasks: Task[][]) => {
          this.sprintTasks = tasks.reduce((acc, val) => acc.concat(val), []);          console.log(this.sprintTasks);
        })
      ).subscribe()

    }
  }

}
