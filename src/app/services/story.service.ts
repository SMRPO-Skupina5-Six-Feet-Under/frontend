import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Story } from '../models/story';
import { HandleErrorService } from './handler-error.service';

@Injectable({
  providedIn: 'root'
})
export class StoryService {

  loadProjectStories(projectId:number): Observable<Story[]>{
    const endpoint = `stories/${projectId}`;

    return this.http.get<Story[]>(endpoint).pipe(
      map(stories => stories.sort((a,b) => a.id - b.id)),
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  saveStory(story: Story): Observable<Story>{
    if(story.id) //*if story has id (it's already in db) update it
      return this.updateStory(story);
    else
      return this.addStory(story);
  }

  private addStory(newStory: Story): Observable<Story>{
    const endpoint = 'story';

    const storyToSave: Story = JSON.parse(JSON.stringify(newStory));
    storyToSave.acceptenceTests = null;
    storyToSave.timeEstimateOriginal = newStory.timeEstimate;
    const obj = {
      story: storyToSave,
      tests: newStory.acceptenceTests,
    }

    return this.http.post<Story>(endpoint, obj).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  private updateStory(story: Story): Observable<Story>{
    const endpoint = `story/${story.id}`;


    const storyToSave: Story = JSON.parse(JSON.stringify(story));
    const newAcceptanceTests = storyToSave.acceptenceTests.filter(test => test.id == null);
    storyToSave.acceptenceTests = storyToSave.acceptenceTests.filter(test => test.id != null);
    const obj = {
      story: storyToSave,
      tests: newAcceptanceTests,
    }
    return this.http.put<Story>(endpoint, obj).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  loadStoryById(id: number): Observable<Story>{
    const endpoint = `story/${id}`;

    return this.http.get<Story>(endpoint).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  updateStoryTimeEstimate(story: Story): Observable<Story>{
    const endpoint = `story/${story.id}/timeEstimate`;

    return this.http.put<Story>(endpoint, story).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }

  updateStorySprint(story: Story): Observable<Story>{
    const endpoint = `story/${story.id}/sprint/`;


    return this.http.put<Story>(endpoint, story).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  deleteStory(storyId: number): Observable<Story>{
    const endpoint = `story/${storyId}`;

    return this.http.delete<Story>(endpoint).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }

  acceptStory(story: Story): Observable<Story>{
    if(story == null) return of(null);

    const storyToAccept: Story = JSON.parse(JSON.stringify(story));
    storyToAccept.isConfirmed = true;
    const endpoint = `story/${storyToAccept.id}/accept`;

    return this.http.post<Story>(endpoint, storyToAccept).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }





  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { 

  }

}
