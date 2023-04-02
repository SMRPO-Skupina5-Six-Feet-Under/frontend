import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StoryPriority } from 'src/app/enums/storyPriority';
import { Story } from 'src/app/models/story';

@Component({
  selector: 'app-story-card',
  templateUrl: './story-card.component.html',
  styleUrls: ['./story-card.component.scss']
})
export class StoryCardComponent {
  private _story: Story;
  @Input() set story(value: Story) {
    if(!value) return;
    this._story = value;
  }
  public get story(): Story {
    return this._story;
  }

  @Output() storyDeleted: EventEmitter<number> = new EventEmitter<number>();
  //-- end of input/output
  storyPriority = StoryPriority;

  displayStoryInfo(){
    console.log('display story info');
    //TODO implement display
  }

  editStory(){
    console.log('edit story');
    //TODO implement edit
  }

  deleteStory(){
    console.log('delete story');
    //TODO implement delete - check for all the parameters that need to be met ->call delete
    
    // this.storyDeleted.emit(this.story.id);
  }


  constructor() { }
  


}
