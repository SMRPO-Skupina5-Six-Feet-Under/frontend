import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';
import { StoryPriority } from 'src/app/enums/storyPriority';
import { Story } from 'src/app/models/story';
import { StoryAcceptanceTest } from 'src/app/models/storyAcceptanceTest';
import { StoryService } from 'src/app/services/story.service';


@Component({
  selector: 'app-user-story-popup',
  templateUrl: './user-story-popup.component.html',
  styleUrls: ['./user-story-popup.component.scss']
})
export class UserStoryPopupComponent {
  @Output() storySaved: EventEmitter<number> = new EventEmitter<number>();
  //-- end of input/output

  userStory: Story;
  visible: boolean = false;
  storyPriorityValues = Object.values(StoryPriority);

  display(story: Story){
    this.userStory = JSON.parse(JSON.stringify(story)); //depp copy
    if(this.userStory != null)
      this.visible = true;
    else
      console.error("User story is null");
  }

  save(){
    console.log(this.userStory)
    const dataOK: boolean = this.checkData();
    if(!dataOK)
      return;
    else{
      this.storyService.saveStory(this.userStory).pipe(
        tap(story => {
          this.toastr.success("User story saved");
          this.storySaved.emit(story.id);
          this.visible = false;
        })
      ).subscribe();
    }
  }

  private checkData(): boolean{
    if(!this.userStory.name || this.userStory.name.length == 0){
      this.toastr.warning("Name is required");
      return false;
    }
    if(!this.userStory.storyDescription || this.userStory.storyDescription.length == 0){
      this.toastr.warning("Description is required");
      return false;
    }
    if(!this.userStory.priority ||  Object.values(StoryPriority).indexOf(this.userStory.priority as StoryPriority) === -1){
      this.toastr.warning("Priority is required");
      return false;
    }
    if(!this.userStory.businessValue || this.userStory.businessValue < 0 
      ||this.userStory.businessValue > 10){
      this.toastr.warning("Business value must be between 0 and 10");
      return false;
    }
    if(!Number.isInteger(this.userStory.businessValue)){
      this.toastr.warning("Business value must be integer");
      return false;
    }
    //! iz SMRPO dailys pise da ni obvezno
    // if(!this.userStory.timeEstimate){
    //   this.toastr.warning("Time estimate is required");
    //   return false;
    // }
    // else if(this.userStory.timeEstimate < 0){
    //   this.toastr.warning("Time estimate must be positive number");
    //   return false;
    // }
    // else if(!Number.isInteger(this.userStory.timeEstimate)){
    //   this.toastr.warning("Time estimate must be integer");
    //   return false;
    // }

    if(this.userStory.acceptanceTests.length == 0){
      this.toastr.warning("At least one acceptance test is required");
      return false;
    }
    
    return true;
  }


  close(){
    this.visible = false;
  }

  deleteAcceptanceTest(index: number){
    this.userStory.acceptanceTests.splice(index, 1);
  }
  addAcceptanceTest(){
    this.userStory.acceptanceTests.push(
      {... new StoryAcceptanceTest(),
        storyId: this.userStory.id, 
        description: ""
      }
    );
  }




  constructor(
    private toastr: ToastrService,
    private storyService: StoryService
  ) { 

  }


}
