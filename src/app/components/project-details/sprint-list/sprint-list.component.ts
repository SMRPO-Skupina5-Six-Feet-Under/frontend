import { Component, Input, ViewChild } from '@angular/core';
import { tap } from 'rxjs';
import { Project } from 'src/app/models/project';
import { Sprint } from 'src/app/models/sprint';
import { SprintService } from 'src/app/services/sprint.service';
import { SprintPopupComponent } from '../../popups/sprint-popup/sprint-popup.component';
import { LoginService } from 'src/app/services/login.service';
import { ToastrService } from 'ngx-toastr';
import { SprintStatus } from 'src/app/enums/sprint-status';

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
  sprintStatus = SprintStatus


  //#region Manage Sprints
  addSprint(){
    const newSprint: Sprint = {
      ... new Sprint(),
      projectId: this.project.id,
    };
    this.sprintPopup.display(newSprint);
  }

  editSprint(sprint: Sprint){
    if(!this.canEditDeleteSprint(sprint)) return;
    this.sprintPopup.display(JSON.parse(JSON.stringify(sprint)));
  }

  canEditDeleteSprint(sprint: Sprint): boolean{
    const today = new Date();
    today.setHours(0,0,0,0);
    const endDate = new Date(sprint.endDate);
    endDate.setHours(0,0,0,0);
    if(endDate <= today){
      this.toastr.warning("This sprint has already ended");
      return false
    }
    const startDate = new Date(sprint.startDate);
    startDate.setHours(0,0,0,0)
    if(startDate <= today){
      this.toastr.warning("This sprint has already started");
      return false
    }

    return true;
  }

  sprintSaved(sprint: Sprint){
    // const sprintIndex = this.sprints.findIndex(s => s.id === sprint.id);
    // if(sprintIndex === -1)
    //   this.sprints.push(sprint);
    // else
    //   this.sprints[sprintIndex] = sprint;
    this.loadSprints();
  }

  private _deleteSprintIndex: number;
  deleteSprint(sprintIndex: number){
    if(!this.canEditDeleteSprint(this.sprints[sprintIndex])) return;
    console.log("deleteSprint ", sprintIndex);
    const openConfirmDeleteBtn = document.getElementById('#openConfirmDeleteModal');
    openConfirmDeleteBtn.click();
    this._deleteSprintIndex = sprintIndex;
  }

  confirmedDeleteSprint(){
    console.log("confirmedDeleteSprint ", this._deleteSprintIndex);
    //!check if sprint can be deleted
    //TODO delete sprint
    if(this._deleteSprintIndex != null){
      const sprint = this.sprints[this._deleteSprintIndex];
      if(sprint)
        this.sprintService.deleteSprint(sprint.id).pipe(
          tap(() => {
            this.sprints.splice(this._deleteSprintIndex, 1);
            //close modal
            const btn = document.getElementById('closeDelSprintConfirmation');
            btn.click();
          })
        ).subscribe();
    }
  }
  
  //#endregion

  @ViewChild(SprintPopupComponent) sprintPopup: SprintPopupComponent;
  constructor(
    private sprintService: SprintService,
    private loginService: LoginService,
    private toastr: ToastrService
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
