import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { tap, Subscription, timer, map, take } from 'rxjs';
import { Project } from 'src/app/models/project';
import { Message, NewMessage } from 'src/app/models/message';
import { ProjectService } from 'src/app/services/project.service';
import { LoginService } from 'src/app/services/login.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-project-forum',
  templateUrl: './project-forum.component.html',
  styleUrls: ['./project-forum.component.scss']
})
export class ProjectForumComponent {
  private _project: Project;
  @Input() set project(project: Project){
    if(!project) return;

    this._project = project;
    this.loadMessages();
    this.currentUser = this.loginService.getLoggedInUser();
  }
  get project(): Project{
    return this._project;
  }

  messages: Message[] = [];
  currentUser: User;
  timerSubscription: Subscription; 
  newMessage: string = "";

  newMsg: NewMessage = {
    ... new NewMessage,
    content: '',
  }

  loadMessages(){
    if(!this.project) return;

    this.projectService.loadMessages(this.project.id).pipe(
      tap((messages: Message[]) => {
        console.log("Messages loaded");
        this.messages = messages;
      })
    ).subscribe().add(() => {
      setTimeout(this.scrollToBottom, 100);
      // it makes call to backedn and updates messages ever 10s
      // timer(0, 10000) call the function after 10s and every 10 seconds 
      this.timerSubscription = timer(10000, 10000).pipe( 
        map(() => { 
          this.updateMessages(); // load data contains the http request 
        }) 
      ).subscribe();
    });
  }

  updateMessages(){
    this.projectService.loadMessages(this.project.id).pipe(
      tap((messages: Message[]) => {
        if(messages.length != this.messages.length){
          this.messages = messages;
          setTimeout(this.scrollToBottom, 100);
        }
      }),
      take(1)
    ).subscribe();
  }

  sendMessage(){
    if(this.newMessage.length === 0){
      return;
    }
    this.newMsg = {
      ... new NewMessage
    };
    this.newMsg.content = this.newMessage;

    this.newMessage = '';
    this.projectService.sendMessage(this.project.id, this.newMsg).pipe(
      tap((message: Message) => {
        if(message){
          this.messages.push(message);
          setTimeout(this.scrollToBottom, 100);
        }
      }),
      take(1)
    ).subscribe();
  }

  ngOnDestroy(): void { 
    this.timerSubscription.unsubscribe(); 
  }

  constructor(
    private projectService: ProjectService,
    private loginService: LoginService,
    private toastr: ToastrService
  ){
    
  }

  private scrollToBottom(){
    try {
        var scroll = document.querySelector('#projectWall');
        scroll.scrollTop = scroll.scrollHeight - scroll.clientHeight;
    } catch(err) { 
      console.log(err);
    }
  }
}
