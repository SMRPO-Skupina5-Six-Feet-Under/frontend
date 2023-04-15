import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { concatMap, map, of, take, tap } from 'rxjs';
import { SprintStatus } from 'src/app/enums/sprint-status';
import { StoryPriority } from 'src/app/enums/storyPriority';
import { Sprint } from 'src/app/models/sprint';
import { Story } from 'src/app/models/story';
import { Task } from 'src/app/models/task';
import { SprintService } from 'src/app/services/sprint.service';
import { StoryService } from 'src/app/services/story.service';
import { TaskService } from 'src/app/services/task.service';
import { StoryTasksPopupComponent } from '../../popups/story-tasks-popup/story-tasks-popup.component';
import { Project } from 'src/app/models/project';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-story-card',
  templateUrl: './story-card.component.html',
  styleUrls: ['./story-card.component.scss']
})
export class StoryCardComponent {
  private _story: Story;
  @Input() set story(value: Story) {
    if(!value) return;
    if(value !== this.story){
      this._story = value;
      this.displayStoryInfo();
      if(this.displayTasks && this.story)
        this.loadStoryTasks();
    }
  }
  public get story(): Story {
    return this._story;
  }

  private _displayTasks: boolean = false;
  @Input() set displayTasks(value: boolean) {
    if(value == null) return;
    if(value !== this.displayTasks){
      this._displayTasks = value;
      if(this.displayTasks && this.story)
        this.loadStoryTasks();
    }
  }
  public get displayTasks(): boolean {
    return this._displayTasks;
  }

  @Input() project: Project;
  @Input() canEdit: boolean = true;
  @Input() canDelete: boolean = true;
  @Input() canAddToActiveSprint: boolean = true;
  @Input() canReject: boolean = true;
  @Input() canEditTasks: boolean = false;


  @Output() storyDeleted: EventEmitter<number> = new EventEmitter<number>();
  @Output() storyEdited: EventEmitter<Story> = new EventEmitter<Story>();
  @Output() addedToActiveSprint: EventEmitter<Story> = new EventEmitter<Story>();
  //-- end of input/output
  storyPriority = StoryPriority;
  addToActiveSprintDisabled: boolean = false;
  storyTasks: Task[] = [];
  currentUserId: number;

  displayStoryInfo(){
    this.addToActiveSprintDisabled = false;
    console.log('display story info');
    if(this.story){
      if(this.story.projectId == null || this.story.sprint_id != null || this.story.isDone ||
         this.story.timeEstimate === 0 || this.story.priority === StoryPriority.wont){
        this.addToActiveSprintDisabled = true;
      }
    }
  }

  editStory(){
    console.log('edit story');
    // this.storyEdited.emit(this.story)
  }

  addToActiveSprint(){
    this.sprintService.loadProjectSprints(this.story.projectId).pipe(
      map((sprints: Sprint[]) => 
      sprints.filter(s => s.status === SprintStatus.active)),
      concatMap((sprints: Sprint[]) => {
        if(sprints.length === 0){
          this.toastr.warning("No active sprint found");
          return of(null);
        } else{
          this.story.sprint_id = sprints[0].id;
          return this.storyService.updateStorySprint(this.story);
        }
      }),
      tap((savedStory: Story) => {
        this.story = JSON.parse(JSON.stringify(savedStory));
        this.addedToActiveSprint.emit(this.story);
      })
    ).subscribe()
  }


  deleteStory(){
    console.log('delete story');
    this.storyService.deleteStory(this.story.id).pipe(
      tap(() => {
        this.storyDeleted.emit(this.story.id);
      })
    ).subscribe();
  }


  //#region Tasks
  editTasks(){
    this.storyCard.display(this.story, this.project);
  }

  acceptTask(task: Task){
    this.taskService.acceptTask(task).pipe(
      tap(() => this.storyEdited.emit(this.story))
    ).subscribe();
  }

  declineTask(task: Task){
    this.taskService.declineTask(task).pipe(
      tap(() => this.storyEdited.emit(this.story))
    ).subscribe();
  }


  storyTasksSaved(story: Story){
    this.storyEdited.emit(this.story);
  }


  //#endregion


  @ViewChild(StoryTasksPopupComponent) storyCard: StoryTasksPopupComponent;
  constructor(
    private storyService: StoryService,
    private sprintService: SprintService,
    private toastr: ToastrService,
    private taskService: TaskService,
    private loginService: LoginService
  ) {
    this.getCurrUserId();
   }
  

  private getCurrUserId(){
    this.loginService.loggedInUser$.pipe(
      tap((user) => {
        if(user != null){
          this.currentUserId = user.id;
        }
      }),
      take(1)
    ).subscribe();
  }

  private loadStoryTasks(){
    if(this.story != null){
      this.taskService.loadStoryTasks(this.story.id).pipe(
        tap((tasks: Task[]) => {
        this.storyTasks = tasks;
        console.log('tasks loaded', this.storyTasks);
      })
      ).subscribe();
    }
  }


}
