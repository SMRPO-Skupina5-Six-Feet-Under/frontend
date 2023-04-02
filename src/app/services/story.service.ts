import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, of, throwError } from 'rxjs';
import { Story } from '../models/story';

@Injectable({
  providedIn: 'root'
})
export class StoryService {

  loadProjectStories(projectId:number): Observable<Story[]>{
    const endpoint = `stories/${projectId}`;

    return this.http.get<Story[]>(endpoint).pipe(
      catchError(err => this.handleError(err)),
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
      catchError(err => this.handleError(err)),
    ); 
  }

  private updateStory(story: Story): Observable<Story>{
    //TODO implement update
    return of(null);
  }

  loadStoryById(id: number): Observable<Story>{
    const endpoint = `story/${id}`;

    return this.http.get<Story>(endpoint).pipe(
      catchError(err => this.handleError(err)),
    ); 
  }





  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
  ) { 

  }


  
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
      this.toastr.error('An error occurred: ' + error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Server error: ${error.status}, body was: `, error.error.detail);
      this.toastr.error(error.error?.detail, `Backend error: ${error.status}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => of(null)/* new Error('Something bad happened; please try again later.') */);
  }
}
