import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { take, tap } from 'rxjs';
import { StoryPriority } from 'src/app/enums/storyPriority';
import { Sprint } from 'src/app/models/sprint';
import { Story } from 'src/app/models/story';
import { Task } from 'src/app/models/task';
import { StoryService } from 'src/app/services/story.service';
import { TaskService } from 'src/app/services/task.service';
import { StoryTasksPopupComponent } from '../../popups/story-tasks-popup/story-tasks-popup.component';
import { Project } from 'src/app/models/project';
import { LoginService } from 'src/app/services/login.service';
import { ProjectRole } from 'src/app/enums/project-role';
import { UserStoryPopupComponent } from '../../popups/user-story-popup/user-story-popup.component';

@Component({
  selector: 'app-story-card',
  templateUrl: './story-card.component.html',
  styleUrls: ['./story-card.component.scss']
})
export class StoryCardComponent {
  //#region inputs/outputs
  private _story: Story;
  @Input() set story(value: Story) {
    if(!value) return;
    if(value !== this.story){
      this._story = value;
      this.setStoryFields();
      if(this.displayTasks && this.story)
        this.loadStoryTasks();

      this.setTooltipText();
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

  private _project: Project;
  @Input() set project(value: Project) {
    if(value == null) return;
    if(value !== this.project){
      this._project = value;
      this.setPermissions();
    }
  }
  public get project(): Project {
    return this._project;
  }

  private _activeSprint: Sprint;
  @Input() set activeSprint(value: Sprint) {
    if(value == null) return;
    this._activeSprint = value;

    this.setTooltipText();
  }
  public get activeSprint(): Sprint {
    return this._activeSprint;
  }

  @Input() canEdit: boolean = false;
  @Input() canDelete: boolean = false;
  @Input() canAddToActiveSprint: boolean = false;
  @Input() canReject: boolean = false;
  //---- display connected inputs
  @Input() canEditTasks: boolean = false;
  //---- end of display connected inputs

  @Output() storyDeleted: EventEmitter<number> = new EventEmitter<number>();
  @Output() storyEdited: EventEmitter<Story> = new EventEmitter<Story>();
  @Output() addedToActiveSprint: EventEmitter<Story> = new EventEmitter<Story>();
  //#endregion
  tooltipText: string = '';
  storyPriority = StoryPriority;
  addToActiveSprintDisabled: boolean = false;
  disableAddToActiveSprintVelocity: boolean = true;
  storyTasks: Task[] = [];
  currentUserId: number;
  remainingTimeSUM: number = 0;

  setStoryFields(){
    this.addToActiveSprintDisabled = false;
    console.log('display story info');
    if(this.story){
      if(this.story.projectId == null || this.story.sprint_id != null || this.story.isDone ||
         this.story.timeEstimate === 0 || this.story.priority === StoryPriority.wont){
        this.addToActiveSprintDisabled = true;
      }
    }
  }

  displayStoryInfo(){
    this.userStoryPopupComponent.display(this.story, true);
  }

  editStory(){
    console.log('edit story');
    this.storyEdited.emit(this.story)
  }

  addToActiveSprint(){
    if(!this.activeSprint){
      this.toastr.warning("No active sprint found");
      return;
    }
    this.story.sprint_id = this.activeSprint.id;
    this.storyService.updateStorySprint(this.story).pipe(
      tap((savedStory: Story) => {
        this.story = JSON.parse(JSON.stringify(savedStory));
        this.addedToActiveSprint.emit(this.story);
      })
    ).subscribe();
  
    // this.sprintService.loadProjectSprints(this.story.projectId).pipe(
    //   map((sprints: Sprint[]) => 
    //   sprints.filter(s => s.status === SprintStatus.active)),
    //   concatMap((sprints: Sprint[]) => {
    //     if(sprints.length === 0){
    //       this.toastr.warning("No active sprint found");
    //       return of(null);
    //     } else{
    //       this.story.sprint_id = sprints[0].id;
    //       return this.storyService.updateStorySprint(this.story);
    //     }
    //   }),
    //   tap((savedStory: Story) => {
    //     this.story = JSON.parse(JSON.stringify(savedStory));
    //     this.addedToActiveSprint.emit(this.story);
    //   })
    // ).subscribe()
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
    this.storyTasksPopup.display(this.story, this.project);
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
    // this.storyEdited.emit(this.story);
    this.loadStoryTasks();
  }


  //#endregion


  @ViewChild(UserStoryPopupComponent) userStoryPopupComponent: UserStoryPopupComponent;
  @ViewChild(StoryTasksPopupComponent) storyTasksPopup: StoryTasksPopupComponent;
  constructor(
    private storyService: StoryService,
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
          this.setPermissions();
        }
      }),
      take(1)
    ).subscribe();
  }

  private setPermissions(){
    if(this.project != null && this.currentUserId != null){
      this.canAddToActiveSprint = this.currentUserId === this.project.scrumMasterUserId;
      this.canEdit = this.currentUserId === this.project.scrumMasterUserId || this.currentUserId === this.project.productOwnerUserId;
      this.canDelete = this.currentUserId === this.project.scrumMasterUserId || this.currentUserId === this.project.productOwnerUserId;
      this.canReject = this.currentUserId === this.project.productOwnerUserId;
      
      this.canEditTasks = (this.currentUserId === this.project.scrumMasterUserId || 
      this.project.projectParticipants.some(p => p.userId === this.currentUserId && p.roleId === ProjectRole.Developer))
      && this.displayTasks && this.story != null && !this.story.isDone;
    }
  }

  private loadStoryTasks(){
    this.remainingTimeSUM = 0;
    if(this.story != null){
      this.taskService.loadStoryTasks(this.story.id).pipe(
        tap((tasks: Task[]) => {
        this.storyTasks = tasks;
        this.remainingTimeSUM = tasks.reduce((sum, task) => sum + task.timeRemainingEstimate ? task.timeRemainingEstimate : 0, 0);
        console.log('tasks loaded', this.storyTasks);
      })
      ).subscribe();
    }
  }

  private setTooltipText(){
    if(this.story != null && this.activeSprint != null){
      const newFilledVelocity = this.activeSprint.velocityFilled + this.story.timeEstimate;
      this.tooltipText = `New sprint velocity ${newFilledVelocity} / ${this.activeSprint.velocity}`;
      this.disableAddToActiveSprintVelocity = newFilledVelocity > this.activeSprint.velocity;
    }
  }


}
