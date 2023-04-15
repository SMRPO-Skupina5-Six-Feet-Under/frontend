import { Component, Input, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';
import { StoryPriority } from 'src/app/enums/storyPriority';
import { Project } from 'src/app/models/project';
import { Story } from 'src/app/models/story';
import { LoginService } from 'src/app/services/login.service';
import { StoryService } from 'src/app/services/story.service';
import { UserStoryPopupComponent } from '../../popups/user-story-popup/user-story-popup.component';
import { SprintService } from 'src/app/services/sprint.service';

@Component({
  selector: 'app-product-backlog',
  templateUrl: './product-backlog.component.html',
  styleUrls: ['./product-backlog.component.scss']
})
export class ProductBacklogComponent {
  private _project: Project;
  @Input() set project(project: Project){
    if(!project) return;

    this._project = project;
    this.loadStories();
    this.setUserCanAddStory(project);
  }
  get project(): Project{
    return this._project;
  }
  //-- end of input/output

  userCanAddStory: boolean = false;

  stories: Story[] = [];
  
  whStories: Story[] = [];
  unasignedStories: Story[] = [];
  assignedStories: Story[] = [];
  finishedStories: Story[] = [];


  //#region StoryDeleted
  unasignedStoryDeleted(storyId: number){
    this.unasignedStories = this.unasignedStories.filter(s => s.id !== storyId);
  }

  whStoryDeleted(storyId: number){
    this.whStories = this.whStories.filter(s => s.id !== storyId);
  }
  
  assignedStoryDeleted(storyId: number){
    this.assignedStories = this.assignedStories.filter(s => s.id !== storyId);
  }

  finishedStoryDeleted(storyId: number){
    this.finishedStories = this.finishedStories.filter(s => s.id !== storyId);
  }
  //#endregion

  //#region AddUserStory
  addUserStory(){
    if(this.project == null){
      this.toastr.warning("Project not loaded");
      return;
    }
    const newUserStory: Story = {
      ...new Story(),
      projectId: this.project.id,
    }
    this.userStoryPopupComponent.display(newUserStory);
  }

  userStorySaved(newStoryId: number){
    this.loadStories();
  }
  //#endregion

  editUserStory(story: Story){
    this.userStoryPopupComponent.display(story);
  }

  addedToActiveSprint(story: Story){
    this.loadStories();
  }

  @ViewChild(UserStoryPopupComponent) userStoryPopupComponent: UserStoryPopupComponent;
  constructor(
    private storyService: StoryService,
    private loginService: LoginService,
    private toastr: ToastrService,
    private sprintService: SprintService
  ) { 

  }

  //#region call when input for project is received
  private setUserCanAddStory(project: Project){
    const loggedInUser = this.loginService.getLoggedInUser();
    if(project && loggedInUser){
      if(project.productOwnerUserId === loggedInUser.id || project.scrumMasterUserId === loggedInUser.id)
        this.userCanAddStory = true;
    }
  }

  private loadStories(){
    if(!this.project) return;
    this.storyService.loadProjectStories(this.project.id).pipe(
      tap((stories: Story[]) => {
        this.stories = stories.sort((a,b) => a.id - b.id);

        this.finishedStories = stories.filter(s => s.isDone);
        stories = stories.filter(s => !s.isDone);
        this.assignedStories = stories.filter(s => s.sprint_id);
        stories = stories.filter(s => !s.sprint_id);
        this.whStories = stories.filter(s => s.priority === StoryPriority.wont);
        stories = stories.filter(s => s.priority !== StoryPriority.wont);
        this.unasignedStories = stories/* .filter(s => !s.sprint_id); */ //the rest are filtered out
      })
      ).subscribe();
  }
  //#endregion


}
