import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, tap } from 'rxjs';
import { ProjectRole } from 'src/app/enums/project-role';
import { Project } from 'src/app/models/project';
import { ProjectParticipantsInput } from 'src/app/models/projectParticipantsInput';
import { User } from 'src/app/models/user';
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

  addProject(){
    this.newProject.name = this.newProject.name?.trim();
    const isPOSelected = this.availableProjectParticipants.some(x => x.projectOwner && x.selected);
    const isSMSelected = this.availableProjectParticipants.some(x => x.scrumMaster && x.selected);
    if(!this.newProject.name){
      this.toastr.warning('Please enter project name!', 'Warning');
      return;
    }
    if(!isPOSelected){
      this.toastr.warning('Please select product owner!', 'Warning');
      return;
    }
    if(!isSMSelected){
      this.toastr.warning('Please select scrum master!', 'Warning');
      return;
    }
    
    this.availableProjectParticipants.filter(x => x.selected).forEach(selectedPP => {
      this.newProject.projectParticipants.push({
        ... new ProjectParticipantsInput,
        userId: selectedPP.userId,
        roleId: selectedPP.roleId
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

  productOwnerSelected(newPOUserId: number){
    this.availableProjectParticipants.forEach(pp => {
      if(pp.userId === newPOUserId){
        pp.projectOwner = true;
        pp.scrumMaster = false;
        pp.developer = false;
        pp.roleId = ProjectRole['Product owner'];
      } 
      else if(pp.projectOwner){
        pp.projectOwner = false;
        pp.developer = true;
        pp.roleId = ProjectRole.Developer;
      } 
    });
  }

  scrumMasterSelected(newSMUserId: number){
    this.availableProjectParticipants.forEach(pp => {
      if(pp.userId === newSMUserId){
        pp.scrumMaster = true;
        pp.projectOwner = false;
        pp.developer = false;
        pp.roleId = ProjectRole['Scrum master'];
      } 
      else if(pp.scrumMaster){
        pp.scrumMaster = false;
        pp.developer = true;
        pp.roleId = ProjectRole.Developer;
      } 
    });
  }


  setRoleIds(){
    this.newProject.projectParticipants.forEach(pp => {
      if(!pp.projectOwner && !pp.scrumMaster) pp.developer = true;
    });
  }

  clearData(){
    this.newProject = {... new Project};
    this.availableProjectParticipants = [];
    this.users.forEach(user => {
      const pp: ProjectParticipantsInput = {
        ... new ProjectParticipantsInput,
        userId: user.id,
        roleId: ProjectRole.Developer,
        username: user.userName,
      };
      this.availableProjectParticipants.push(pp);
    });    
  }

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.loadProjects();
   }

   private loadProjects(){
    combineLatest([
      this.projectService.loadProjects(),
      this.userService.getAllUsers(),
      ]).pipe(
        map(([projects, users]: [Project[], User[]]) => {
          this.users = users;
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

}
