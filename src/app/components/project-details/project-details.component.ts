import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';
import { Project } from 'src/app/models/project';
import { Story } from 'src/app/models/story';
import { ProjectService } from 'src/app/services/project.service';
import { UserStoryPopupComponent } from '../popups/user-story-popup/user-story-popup.component';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent {
  projectId: number;
  project: Project;

  displayingSprintBacklog: boolean = false;
  displayingProductBacklog: boolean = !this.displayingSprintBacklog;

  //#region EditUsers
  //TODO: treba komponento za urejanje userjev //najlažje modal -> premakni logiko v servis za bo ista tu in na project list
  editProjectUsers(){ 
    //dummy nastavek
    console.log("editUsers");
  }
  //#endregion


  //#region Sprints -> neznam tono kaj bo se tu 
  showSprints(){
    //dummy nastavek
    console.log("showSprints");
  }
  //#endregion

  //#region Display toogle
  showProductBacklog(){
    //TODO komponenta posebaj, ki bo prikazala product backlog 
    // Nalozit product backlog (ce še ni naložen) pogledat kk sploh
    this.toggleDisplayPrintProdutBacklog();
  }

  showSprintBacklog(){
    //TODO posebaj komponenta za sprint backlog
    this.toggleDisplayPrintProdutBacklog();
  }

  private toggleDisplayPrintProdutBacklog(){
    this.displayingProductBacklog = !this.displayingProductBacklog;
    this.displayingSprintBacklog = !this.displayingSprintBacklog;
  }
  //#endregion


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private toastr: ToastrService,
  ) { 
    
  }

  private loadProject(){
    this.projectService.loadProjectById(this.projectId).pipe(
      tap((project: Project) => {
        console.log("projectLoaded");
        this.project = project;
        console.log(this.project);
      }
    )).subscribe();
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
