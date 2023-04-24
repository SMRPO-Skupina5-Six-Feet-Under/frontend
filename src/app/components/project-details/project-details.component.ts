import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import { SprintStatus } from 'src/app/enums/sprint-status';
import { Project } from 'src/app/models/project';
import { Sprint } from 'src/app/models/sprint';
import { LoginService } from 'src/app/services/login.service';
import { ProjectService } from 'src/app/services/project.service';
import { SprintService } from 'src/app/services/sprint.service';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent {
  projectId: number;
  project: Project;
  activeSprint: Sprint;

  displayingProductBacklog: boolean = true;
  displayingSprintBacklog: boolean = false;
  displayingSprints: boolean = false;
  displayingForum: boolean = false;
  displayingUserDocs: boolean = false;

  userIsScrumMaster: boolean = false;
  userIsProductOwner: boolean = false;
  userIsDeveloper: boolean = false;

  //#region EditUsers
  // editProjectUsers(){ //? not gonna be used 
  //   //dummy nastavek
  //   console.log("editUsers");
  // }
  //#endregion


  //#region Sprints -> neznam tono kaj bo se tu 
  showSprints(){
    //dummy nastavek
    this.displayingProductBacklog = false;
    this.displayingSprintBacklog = false;
    this.displayingForum = false;
    this.displayingUserDocs = false;
    this.displayingSprints = true;
  }
  //#endregion

  //#region Display toogle
  showProductBacklog(){
    this.displayingSprintBacklog = false;
    this.displayingSprints = false;
    this.displayingForum = false;
    this.displayingUserDocs = false;
    this.displayingProductBacklog = true;
  }

  showSprintBacklog(){
    this.displayingProductBacklog = false;
    this.displayingSprints = false;
    this.displayingForum = false;
    this.displayingUserDocs = false;
    this.displayingSprintBacklog = true;
  }

  showProjectForum(){
    this.displayingProductBacklog = false;
    this.displayingSprints = false;
    this.displayingSprintBacklog = false;
    this.displayingUserDocs = false;
    this.displayingForum = true;
  }

  showUserDocs(){
    this.displayingProductBacklog = false;
    this.displayingSprints = false;
    this.displayingSprintBacklog = false;
    this.displayingForum = false;
    this.displayingUserDocs = true;
  }
  //#endregion


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private loginService: LoginService,
    private sprintService: SprintService
  ) { 
    
  }

  private loadProject(){
    this.projectService.loadProjectById(this.projectId).pipe(
      tap((project: Project) => {
        console.log("projectLoaded");
        this.project = project;
        console.log(this.project);
        this.setUserPermissions();
        this.loadActiveSprint(this.project);
      }
    )).subscribe();
  }

  private setUserPermissions(){
    const currUser = this.loginService.getLoggedInUser();
    if(currUser){
      this.userIsScrumMaster = this.project.scrumMasterUserId === currUser.id;
      this.userIsProductOwner = this.project.productOwnerUserId === currUser.id;
      this.userIsDeveloper = this.project.developerParticipantUserNames.find(x => x === currUser.userName) != null;
    }
  }

  private loadActiveSprint(project: Project){
    this.sprintService.loadProjectSprints(project.id).pipe(
      tap((sprints: Sprint[]) => {
        this.activeSprint = sprints.filter(s => s.status === SprintStatus.active)?.[0];
      })
    ).subscribe();
  }


ngOnInit(): void {	
  this.route.paramMap.pipe(
    tap(params => {
      console.log(params);
      console.log(params.get('id'));
      this.projectId = parseInt(params.get('id'));
      if(this.projectId == null)
        this.router.navigate(['/projects']);
      else
        this.loadProject();

    })
  ).subscribe();
  
}




}
