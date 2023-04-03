import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { Story } from '../models/story';
import { HandleErrorService } from './handler-error.service';

@Injectable({
  providedIn: 'root'
})
export class StoryService {

  loadProjectStories(projectId:number): Observable<Story[]>{
    const endpoint = `stories/${projectId}`;

    return this.http.get<Story[]>(endpoint).pipe(
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
    const obj = {
      story: newStory,
      tests: newStory.acceptanceTests,
    }

    return this.http.post<Story>(endpoint, obj).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }

  private updateStory(story: Story): Observable<Story>{
    //TODO implement update
    return of(null);
  }

  loadStoryById(id: number): Observable<Story>{
    const endpoint = `story/${id}`;

    return this.http.get<Story>(endpoint).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    ); 
  }





  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { 

  }

}
