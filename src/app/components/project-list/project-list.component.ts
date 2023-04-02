import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, tap } from 'rxjs';
import { ProjectRole } from 'src/app/enums/project-role';
import { Project } from 'src/app/models/project';
import { ProjectParticipantsInput } from 'src/app/models/projectParticipantsInput';
import { User } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent {
  projects: Project [] = [];

  private users: User [] = [];
  availableProjectParticipants: ProjectParticipantsInput[] = [];
  

  newProject: Project = {
    ... new Project,
  }

  currentUserAdmin: boolean = false;

  /* #region Modal stuff */
//--------------------------
  addProject(){
    this.newProject.name = this.newProject.name?.trim();
    if(!this.newProject.name){
      this.toastr.warning('Please enter project name!', 'Warning');
      return;
    }

    const isPOSelected = this.availableProjectParticipants.some(x => x.productOwner && x.selected);
    if(!isPOSelected){
      this.toastr.warning('Please select product owner!', 'Warning');
      return;
    }

    const isSMSelected = this.availableProjectParticipants.some(x => x.scrumMaster && x.selected);
    if(!isSMSelected){
      this.toastr.warning('Please select scrum master!', 'Warning');
      return;
    }

    const isDSelected = this.availableProjectParticipants.some(x => x.developer && x.selected);
    if(!isDSelected){
      this.toastr.warning('Please select at least 1 developer!', 'Warning');
      return;
    }
    
    this.newProject.projectParticipants = [];
    this.availableProjectParticipants.filter(x => x.selected).forEach(selectedPP => {
      if(selectedPP.scrumMaster)
        this.newProject.projectParticipants.push({
          ... new ProjectParticipantsInput,
          userId: selectedPP.userId,
          roleId: ProjectRole['Scrum master']
        });
      if(selectedPP.developer)
        this.newProject.projectParticipants.push({
          ... new ProjectParticipantsInput,
          userId: selectedPP.userId,
          roleId: ProjectRole.Developer
        });
      if(selectedPP.productOwner)
        this.newProject.projectParticipants.push({
          ... new ProjectParticipantsInput,
          userId: selectedPP.userId,
          roleId: ProjectRole['Product owner']
        });
    });
    
    this.projectService.addProject(this.newProject).pipe(
      tap((project: Project) => {
        if(project){

          this.loadProjects();
          this.clearData();
          this.toastr.success('Project added successfully!', 'Success');
          const cancelModalButton = document.getElementById('cancelModalButton');
          cancelModalButton.click();
        }
      })
    ).subscribe();
  }

  userSelected(newPOUserId: number, isCurrentlySelected: boolean){
    if(!isCurrentlySelected){
      this.availableProjectParticipants.forEach(pp => {
        if(pp.userId === newPOUserId && !pp.productOwner && !pp.scrumMaster){
          pp.developer = true;
          return;
        } 
      });
    }
  }

  productOwnerSelected(newPOUserId: number){
    this.availableProjectParticipants.forEach(pp => {
      if(pp.userId === newPOUserId){
        pp.productOwner = true;
        pp.selected = true;
        pp.scrumMaster = false;
        pp.developer = false;
      } 
      else if(pp.productOwner){
        pp.productOwner = false;
        pp.developer = true;
      } 
    });
  }

  scrumMasterSelected(newSMUserId: number){
    this.availableProjectParticipants.forEach(pp => {
      if(pp.userId === newSMUserId){
        pp.scrumMaster = true;
        pp.productOwner = false;
        pp.selected = true;
      } 
      else if(pp.scrumMaster){
        pp.scrumMaster = false;
        pp.developer = true;
        pp.selected = true;
      } 
    });
  }

  developerSelected(newDUserId: number){
    const availablePP = this.availableProjectParticipants.find(x => x.userId === newDUserId);
    if(availablePP){
      availablePP.productOwner = false;
      availablePP.selected = true;
    }
  }


  // setRoleIds(){
  //   this.newProject.projectParticipants.forEach(pp => {
  //     if(!pp.projectOwner && !pp.scrumMaster) pp.developer = true;
  //   });
  // }

  clearData(){
    console.log("clearData", this.users);
    this.newProject = {... new Project};
    this.setProjectParticipants();
  }

  private setProjectParticipants(){
    this.availableProjectParticipants = [];
    this.users.forEach(user => {
      const pp: ProjectParticipantsInput = {
        ... new ProjectParticipantsInput,
        userId: user.id,
        username: user.userName,
      };
      this.availableProjectParticipants.push(pp);
    });
  }

/* #endregion */

  editProject(projectId: number){
    this.router.navigate(['/project', {id: projectId}]);
  }

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private toastr: ToastrService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loadProjects();

    this.setCurrentUserPermissions();
   }

   private loadProjects(){
    combineLatest([
      this.projectService.loadProjects(),
      this.userService.getAllUsers(),
      ]).pipe(
        map(([projects, users]: [Project[], User[]]) => {
          console.log(users);
          this.users = users;
          if(this.availableProjectParticipants.length === 0)
            this.setProjectParticipants();

          for (const project of projects) { //nastavimo propertije projektov za prikaz
            const scrumMasterUserId = project.projectParticipants.find(pp => pp.roleId === ProjectRole['Scrum master']);
            const productOwnerUserId = project.projectParticipants.find(pp => pp.roleId === ProjectRole['Product owner']);
            if(scrumMasterUserId)
              project.scrumMasterUserName = users.find(u => u.id === scrumMasterUserId.userId).userName;
            if(productOwnerUserId)
              project.productOwnerUserName = users.find(u => u.id === productOwnerUserId.userId).userName;
            const developerUserIds: number [] = project.projectParticipants.filter(pp => pp.roleId === ProjectRole.Developer).map(pp => pp.userId);
            project.developerParticipantUserNames = users.filter(u => developerUserIds.some(dui => dui === u.id)).map(u => u.userName);
          }
          return projects;
        }),
        tap((projects: Project[]) => {
          this.projects = projects;
        })
      ).subscribe();
   }

    private setCurrentUserPermissions(){
      const currUser = this.loginService.getLoggedInUser();
      this.currentUserAdmin = currUser.isAdmin;
    }
}
