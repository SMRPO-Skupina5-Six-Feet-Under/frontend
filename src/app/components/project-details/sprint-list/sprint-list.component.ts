import { Component, Input, ViewChild } from '@angular/core';
import { tap } from 'rxjs';
import { Project } from 'src/app/models/project';
import { Sprint } from 'src/app/models/sprint';
import { SprintService } from 'src/app/services/sprint.service';
import { SprintPopupComponent } from '../../popups/sprint-popup/sprint-popup.component';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-sprint-list',
  templateUrl: './sprint-list.component.html',
  styleUrls: ['./sprint-list.component.scss']
})
export class SprintListComponent {
  private _project: Project;
  @Input() set project(project: Project){
    if(!project) return;

    this._project = project;
    this.loadSprints();
    this.setUserCanAddStory(project);
  }
  get project(): Project{
    return this._project;
  }

  //-- end of input/output
  sprints: Sprint[] = [];
  userIsScrumMaster: boolean = false;

  //#region Manage Sprints
  addSprint(){
    const newSprint: Sprint = {
      ... new Sprint(),
      projectId: this.project.id,
    };
    this.sprintPopup.display(newSprint);
  }

  sprintSaved(sprint: Sprint){
    this.sprints.push(sprint);
  }

  deleteSprint(sprintIndex: number){
    //TODO --> treba preverit če je master
    console.log("deleteSprint ", sprintIndex);
   //TODO modal for confirmation
  }

  confirmedDeleteSprint(sprintIndex: number){
    console.log("confirmedDeleteSprint ", sprintIndex);
    //!check if sprint can be deleted
    //TODO delete sprint

  }
  
  //#endregion

  @ViewChild(SprintPopupComponent) sprintPopup: SprintPopupComponent;
  constructor(
    private sprintService: SprintService,
    private loginService: LoginService,
  ){
    
  }



  //#region Sprint Loaded

  private setUserCanAddStory(project: Project){
    const loggedInUser = this.loginService.getLoggedInUser();
    if(project && loggedInUser){
      if(project.scrumMasterUserId === loggedInUser.id)
        this.userIsScrumMaster = true;
    }
  }

  private loadSprints(){
    if(!this.project) return;

    this.sprintService.loadProjectSprints(this.project.id).pipe(
      tap((sprints: Sprint[]) => {
        console.log("sprintsLoaded");
        this.sprints = sprints;
      })
    ).subscribe();
  }

  //#endregion
}
