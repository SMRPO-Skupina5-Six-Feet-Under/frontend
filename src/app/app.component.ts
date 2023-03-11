import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'G5-Scrum';

  isUserLoggedIn: boolean = false;
  loggedInUserName: string = "johnDoe";


  passReveal(){
    console.log("reveal password");
  }
  
  passRevealLast(){
    console.log("reveal password");
  }


  constructor (

  )
  {

  }


}
