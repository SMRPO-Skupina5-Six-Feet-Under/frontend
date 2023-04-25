import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
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
import { RejectReasonPopupComponent } from '../../popups/reject-reason-popup/reject-reason-popup.component';

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
      this.originalTimeEstimate = this._story.timeEstimate;
      if(this.displayTasks && this.story)
        this.loadStoryTasks();

      this.setTooltipText();
    }
  }
  public get story(): Story {
    return this._story;
  }
  public set storyTimeEstimate(value: number) {
    this._story.timeEstimate = value;
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

  private _storyUnasigned: boolean = false;
  @Input() set storyUnasigned(value: boolean) {
    if(value == null) return;
    this._storyUnasigned = value;
  }
  public get storyUnasigned(): boolean {
    return this._storyUnasigned;
  }

  @Input() canEdit: boolean = false;
  @Input() canDelete: boolean = false;
  @Input() canAddToActiveSprint: boolean = false;
  @Input() canReject: boolean = false;
  @Input() displayAcceptStory: boolean = false;
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
  currentUserPO: boolean = false;
  currentUserSM: boolean = false;
  remainingTimeSUM: number = 0;
  originalTimeEstimate: number;

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
    if(this.originalTimeEstimate == this.story.timeEstimate){
      this.storyService.updateStorySprint(this.story).pipe(
        tap((savedStory: Story) => {
          this.story = JSON.parse(JSON.stringify(savedStory));
          this.addedToActiveSprint.emit(this.story);
        })
      ).subscribe();
    }else{
      // if user changed time estimate, then update time estimate first and then move story to assigned
      this.storyService.updateStoryTimeEstimate(this.story).pipe(
        tap((savedStory: Story) => {
        })
      ).subscribe().add(() => {
        this.storyService.updateStorySprint(this.story).pipe(
          tap((savedStory: Story) => {
            this.story = JSON.parse(JSON.stringify(savedStory));
            this.addedToActiveSprint.emit(this.story);
          })
        ).subscribe();
      });
    }

  
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

  acceptStory(){
    this.storyService.acceptStory(this.story).pipe(
      tap((savedStory: Story) => {
        this.story = JSON.parse(JSON.stringify(savedStory));
        // this.storyEdited.emit(this.story);
        this.addedToActiveSprint.emit(this.story);
      })
    ).subscribe();
  }


  deleteStory(){
    console.log('delete story');
    this.storyService.deleteStory(this.story.id).pipe(
      tap(() => {
        this.storyDeleted.emit(this.story.id);
      })
    ).subscribe();
  }


//#region reject story
  openRejectReasonPopup(){
    this.rejectReasonPopup.display();
  }

  rejectStory(rejectReason: string){
   this.story.rejectReason = rejectReason;
    this.storyService.rejectStory(this.story)
    .pipe(
      tap((savedStory: Story) => {
        this.story = JSON.parse(JSON.stringify(savedStory));
        this.addedToActiveSprint.emit(savedStory);
      })
    ).subscribe();
  }

  //#endregion


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

  // for updating time estimates directly
  checkTimeEstimate(){
    let newtimeEstimate: number;
    
    try{
      newtimeEstimate = Number(this.timeEstimateInput.nativeElement.value);
    }
    catch(e){
      this.toastr.warning("Time estimate must be integer");
      return;
    }

    if(newtimeEstimate && !Number.isInteger(newtimeEstimate)){
      this.toastr.warning("Time estimate must be integer");
      return;
    }
    if(newtimeEstimate < 0){
      this.toastr.warning("Time estimate must be positive number");
      return;
    }
    this._story.timeEstimate = newtimeEstimate;
    this.setStoryFields();
    this.setTooltipText();
  }

  saveTimeEstimate(){
    let newtimeEstimate: number;
    
    try{
      newtimeEstimate = Number(this.timeEstimateInput.nativeElement.value);
    }
    catch(e){
      this.toastr.warning("Time estimate must be integer");
      return;
    }

    if(newtimeEstimate && !Number.isInteger(newtimeEstimate)){
      this.toastr.warning("Time estimate must be integer");
      return;
    }
    if(newtimeEstimate < 0){
      this.toastr.warning("Time estimate must be positive number");
      return;
    }

    this._story.timeEstimate = newtimeEstimate;
    this.setStoryFields();
    this.setTooltipText();

    this.storyService.updateStoryTimeEstimate(this.story).pipe(
      tap((savedStory: Story) => {
        this.toastr.success("Time estimate successfully changed.");
      })
    ).subscribe();
  }


  @ViewChild(RejectReasonPopupComponent) rejectReasonPopup: RejectReasonPopupComponent;
  @ViewChild(UserStoryPopupComponent) userStoryPopupComponent: UserStoryPopupComponent;
  @ViewChild(StoryTasksPopupComponent) storyTasksPopup: StoryTasksPopupComponent;
  @ViewChild('timeEstimateInput') timeEstimateInput: ElementRef;
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
      this.currentUserSM = this.currentUserId === this.project.scrumMasterUserId;
      this.currentUserPO = this.currentUserId === this.project.productOwnerUserId;
      this.canAddToActiveSprint = this.currentUserSM;
      this.canEdit = this.currentUserSM || this.currentUserPO;
      this.canDelete = this.currentUserSM || this.currentUserPO;
      

      this.canEditTasks = (this.currentUserSM || 
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
        this.remainingTimeSUM = tasks.reduce((sum, task) => sum + (task.timeRemainingEstimate ? task.timeRemainingEstimate : 0), 0);
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
