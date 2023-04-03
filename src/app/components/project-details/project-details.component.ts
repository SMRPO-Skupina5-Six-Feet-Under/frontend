import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';
import { Project } from 'src/app/models/project';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent {
  projectId: number;
  project: Project;

  displayingProductBacklog: boolean = true;
  displayingSprintBacklog: boolean = false;
  displayingSprints: boolean = false;

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
    this.displayingProductBacklog = false;
    this.displayingSprintBacklog = false;
    this.displayingSprints = true;
  }
  //#endregion

  //#region Display toogle
  showProductBacklog(){
    this.displayingSprintBacklog = false;
    this.displayingSprints = false;
    this.displayingProductBacklog = true;
  }

  showSprintBacklog(){
    //TODO posebaj komponenta za sprint backlog
    this.displayingProductBacklog = false;
    this.displayingSprints = false;
    this.displayingSprintBacklog = true;
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
