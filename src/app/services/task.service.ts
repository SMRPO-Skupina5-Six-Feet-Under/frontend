import { Injectable } from '@angular/core';
import { HandleErrorService } from './handler-error.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, combineLatest, filter, map, of, take, tap } from 'rxjs';
import { Task } from '../models/task';
import { User } from '../models/user';
import { UserService } from './user.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  userCacheCount = 0;

  loadStoryTasks(storyId: number): Observable<Task[]>{
    if(!storyId) return of(null);
    const endpoint = `task/${storyId}/all`;

    let usersObservable: Observable<User[]> = this.userService.allUsers$
    .asObservable().pipe(filter(users => users != null && users.length > 0));
    if(this.userCacheCount > 50){
      usersObservable = this.userService.getAllUsers();
      this.userCacheCount = 0;
    }
    this.userCacheCount++;
    

    return combineLatest([this.http.get<Task[]>(endpoint),
      usersObservable.pipe(take(1))]).pipe(
      map(([tasks, users]: [Task[], User[]]) => {
        tasks.forEach(task => {
          this.setTaskClientProperties(task,users);
        });
        return tasks.sort((a,b) => a.id - b.id);
      }),
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }

  //#region Save tasks
  saveTask(task: Task): Observable<Task>{
    if(task == null) return of(null);
    task.name = task.description;
    if(task.id)
      return this.updateTask(task);
    else
      return this.addTask(task);
  }

  private addTask(newTask: Task): Observable<Task>{
    const endpoint = `task/${newTask.storyId}`;

    return this.http.post<Task>(endpoint, newTask).pipe(
      tap(() => this.toastr.success('Task added successfully')),
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }

  private updateTask(task: Task): Observable<Task>{
    const endpoint = `task/${task.id}`;
    
    return this.http.put<Task>(endpoint, task).pipe(
      tap(() => this.toastr.success('Task updated successfully')),
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }

  //#endregion


  deleteTask(taskId: number): Observable<Task>{
    const endpoint = `task/${taskId}`;
    
    return this.http.delete<Task>(endpoint).pipe(
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }

  acceptTask(task: Task): Observable<Task>{
    if(task == null) return of(null);
    const endpoint = `task/${task.id}/accept`;
    
    task.hasAssigneeConfirmed = true;
    return this.http.put<Task>(endpoint, task).pipe(
      tap(() => this.toastr.success('Task accepted')),
      catchError(err => this.handleErrorService.handleError(err))
    );
  }

  declineTask(task: Task): Observable<Task>{
    if(task == null) return of(null);
    const endpoint = `task/${task.id}/decline`;

    task.hasAssigneeConfirmed = false;
    return this.http.put<Task>(endpoint, task).pipe(
      tap(() => this.toastr.success('Task declined')),
      catchError(err => this.handleErrorService.handleError(err))
    );
  }

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService,
    private userService: UserService,
    private toastr: ToastrService
  ) { }

  private setTaskClientProperties(task: Task, users: User[]){
    if(task == null) return;
    const user = users.find(u => u.id == task.assigneeUserId);
    task.asigneeFullName = user ? user.firstName + ' ' + user.lastName : '';
  }
}
