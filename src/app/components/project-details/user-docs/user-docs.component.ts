import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { tap, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Project, ProjectDocumentation } from 'src/app/models/project';
import { LoginService } from 'src/app/services/login.service';
import { ProjectService } from 'src/app/services/project.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-docs',
  templateUrl: './user-docs.component.html',
  styleUrls: ['./user-docs.component.scss']
})
export class UserDocsComponent {
  private _project: Project;
  @Input() set project(project: Project){
    if(!project) return;

    this._project = project;
    this.currentUser = this.loginService.getLoggedInUser();
    this.documentation = project.documentation;
  }
  get project(): Project{
    return this._project;
  }

  newDocumentation: ProjectDocumentation = {
    ... new ProjectDocumentation,
    text: '',
  }

  currentUser: User;
  documentation: string;
  selectedFileName: string = '';

  openFile(event: any){
    // check if there is a file inputed
    if(this.fileInput.nativeElement.files && this.fileInput.nativeElement.files[0]) {
      var file: File = this.fileInput.nativeElement.files[0];
      this.selectedFileName = "Uploaded file: " + file.name;
      /*
      this.projectService.convertFileToString(file).pipe(
        tap((content: string) => {
          if(content){
            this.documentation = content
          }
        }),
        take(1)
      ).subscribe();
      */

      var reader = new FileReader();

      reader.addEventListener("load", (e) => {
        this.documentation = e.target.result.toString();
        this.save();
      });

      reader.readAsText(file);
    }
  }

  appendFile(event: any){
    // check if there is a file inputed
    if(this.fileAppend.nativeElement.files && this.fileAppend.nativeElement.files[0]) {
      var file: File = this.fileAppend.nativeElement.files[0];
      this.selectedFileName = "Uploaded file: " + file.name;
      var reader = new FileReader();

      reader.addEventListener("load", (e) => {
        this.documentation = this.documentation.concat(e.target.result.toString());
        this.save();
      });

      reader.readAsText(file);
    }
  }

  save(){
    this._project.documentation = this.documentation;
    this.newDocumentation = {
      ... new ProjectDocumentation
    };
    this.newDocumentation.text = this.documentation;

    this.projectService.saveDocumentation(this.project.id, this.newDocumentation).pipe(
      tap((content: string) => {
        if(content){
          this.toastr.success('Documentation successfully saved.', 'Success');
        }
      }),
      take(1)
    ).subscribe();
  }

  downloadFile(){
    //https://www.tutorialspoint.com/how-to-create-and-save-text-file-in-javascript
    const link = document.createElement("a");
    const file = new Blob([this.documentation], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = this.project.name + " user documentation";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('fileAppend') fileAppend: ElementRef;
  constructor(
    private projectService: ProjectService,
    private loginService: LoginService,
    private toastr: ToastrService
  ){
    
  }
}
