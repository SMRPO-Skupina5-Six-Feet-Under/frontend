import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { concatMap, map, of, tap } from 'rxjs';
import { SprintStatus } from 'src/app/enums/sprint-status';
import { StoryPriority } from 'src/app/enums/storyPriority';
import { Sprint } from 'src/app/models/sprint';
import { Story } from 'src/app/models/story';
import { SprintService } from 'src/app/services/sprint.service';
import { StoryService } from 'src/app/services/story.service';

@Component({
  selector: 'app-story-card',
  templateUrl: './story-card.component.html',
  styleUrls: ['./story-card.component.scss']
})
export class StoryCardComponent {
  private _story: Story;
  @Input() set story(value: Story) {
    if(!value) return;
    if(value !== this.story){
      this._story = value;
      this.displayStoryInfo();
    }
  }
  public get story(): Story {
    return this._story;
  }

  @Output() storyDeleted: EventEmitter<number> = new EventEmitter<number>();
  @Output() storyEdited: EventEmitter<Story> = new EventEmitter<Story>();
  @Output() addedToActiveSprint: EventEmitter<Story> = new EventEmitter<Story>();
  //-- end of input/output
  storyPriority = StoryPriority;
  addToActiveSprintDisabled: boolean = false;

  displayStoryInfo(){
    this.addToActiveSprintDisabled = false;
    console.log('display story info');
    //TODO implement display
    if(this.story){
      if(this.story.projectId == null || this.story.sprint_id != null || this.story.isDone ||
         this.story.timeEstimate === 0 || this.story.priority === StoryPriority.wont){
        this.addToActiveSprintDisabled = true;
      }
    }
  }

  editStory(){
    console.log('edit story');
    this.storyEdited.emit(this.story)
  }

  addToActiveSprint(){
    this.sprintService.loadProjectSprints(this.story.projectId).pipe(
      map((sprints: Sprint[]) => 
      sprints.filter(s => s.status === SprintStatus.active)),
      concatMap((sprints: Sprint[]) => {
        if(sprints.length === 0){
          this.toastr.warning("No active sprint found");
          return of(null);
        } else{
          this.story.sprint_id = sprints[0].id;
          return this.storyService.updateStorySprint(this.story);
        }
      }),
      tap((savedStory: Story) => {
        this.story = JSON.parse(JSON.stringify(savedStory));
        this.addedToActiveSprint.emit(this.story);
      })
    ).subscribe()
  }


  deleteStory(){
    console.log('delete story');
    this.storyService.deleteStory(this.story.id).pipe(
      tap(() => {
        this.storyDeleted.emit(this.story.id);
      })
    ).subscribe();
  }


  constructor(
    private storyService: StoryService,
    private sprintService: SprintService,
    private toastr: ToastrService
  ) { }
  


}
