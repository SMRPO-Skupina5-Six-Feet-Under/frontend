import { Injectable } from '@angular/core';
import { HandleErrorService } from './handler-error.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, combineLatest, filter, map, of, take, tap } from 'rxjs';
import { Task } from '../models/task';
import { User } from '../models/user';
import { UserService } from './user.service';
import { ToastrService } from 'ngx-toastr';
import { Sprint } from '../models/sprint';
import { WorkTime } from '../models/workTime';

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


  loadTasksForActiveSprintUser(activeSprint: Sprint, currentUser: User): Observable<Task[]>{
    if(!activeSprint || !currentUser) return of([]);
    const endpoint = `task/${activeSprint.id}/${currentUser.id}/all`;

    return this.http.get<Task[]>(endpoint).pipe(
      map((tasks: Task[]) => tasks.sort((a,b) => a.id - b.id)),
      catchError(err => this.handleErrorService.handleError(err)),
      take(1)
    );
  }

  //#region Task work times
  startTask(task: Task): Observable<Task>{
    if(task == null) return of(null);
    const endpoint = `task/start/${task.id}`;

    return this.http.put<Task>(endpoint, task).pipe(
      tap(() => this.toastr.success('Task started')),
      catchError(err => this.handleErrorService.handleError(err))
    );
  }

  stopTask(task: Task): Observable<WorkTime>{
    if(task == null) return of(null);
    const endpoint = `task/stop/${task.id}`;

    return this.http.put<WorkTime>(endpoint, task).pipe(
      tap(() => this.toastr.success('Task stopped')),
      catchError(err => this.handleErrorService.handleError(err))
    );
  }

  loadMyWorkTimesTask(task: Task): Observable<WorkTime[]>{
    if(task == null) return of([]);
    const endpoint = `task/worktime/my/${task.id}`;

    return this.http.get<WorkTime[]>(endpoint).pipe(
      map((workTimes : WorkTime[]) => {
        workTimes.forEach(workTime => {
          // workTime.date = new Date(workTime.date);
          // workTime.date = new Date(workTime.date.getTime() + Math.abs((workTime.date.getTimezoneOffset() * 60000)));
        });
        return workTimes;
      }),
      map((workTimes: WorkTime[]) => {
        const orderedWorkTimes = workTimes.sort((a,b) => {
          return (new Date(a.date)).getTime() - (new Date(b.date)).getTime();
        });

        return orderedWorkTimes;
      }),
      catchError(err => this.handleErrorService.handleError(err)),
      take(1)
    );
  }

  saveWorkTime(workTime: WorkTime): Observable<WorkTime>{
    if(workTime == null) return of(null);
    
    const saveWorkTime: WorkTime = JSON.parse(JSON.stringify(workTime));
    saveWorkTime.date = new Date(saveWorkTime.date);
    saveWorkTime.date = new Date(saveWorkTime.date.getTime() + Math.abs((saveWorkTime.date.getTimezoneOffset() * 60000)));
    saveWorkTime.date = this.convertDateToUTC(saveWorkTime.date);
    console.log("workTime saved: ", saveWorkTime);
    if(saveWorkTime.id)
      return this.updateWorkTime(saveWorkTime);
    else
      return this.addWorkTime(saveWorkTime);
  }

  private updateWorkTime(workTime: WorkTime): Observable<WorkTime>{
    const endpoint = `task/worktime/${workTime.id}`;

    return this.http.put<WorkTime>(endpoint, workTime).pipe(
      // tap(() => this.toastr.success('Work time updated successfully')),
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }

  private addWorkTime(workTime: WorkTime): Observable<WorkTime>{
    const endpoint = `task/worktime/${workTime.taskId}`;

    return this.http.post<WorkTime>(endpoint, workTime).pipe(
      // tap(() => this.toastr.success('Work time updated successfully')),
      catchError(err => this.handleErrorService.handleError(err)),
    );
  }

  private convertDateToUTC(date: Date): Date{ 
    // const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), 
    // date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(),
    // date.getUTCSeconds()); 
    // console.log('utc-date', utcDate);

    let dateDiff = new Date(date.toLocaleDateString());
    // console.log('dateDiff', dateDiff);
    // let utcDateDiff = new Date(utcDate.toLocaleDateString());
    // console.log('utcDateDiff', utcDateDiff);

    const dateDiffDateUTC = new Date(Date.UTC(
      dateDiff.getFullYear(), dateDiff.getMonth(), dateDiff.getDate(),
      dateDiff.getHours(), dateDiff.getMinutes(), dateDiff.getSeconds()));
    console.log('dateDiffDateUTC', dateDiffDateUTC);

    // const dateDiffDateUTCGetUTC = new Date(Date.UTC(
    //   dateDiff.getUTCFullYear(), dateDiff.getUTCMonth(), dateDiff.getUTCDate(),
    //   dateDiff.getUTCHours(), dateDiff.getUTCMinutes(), dateDiff.getUTCSeconds()));
    // console.log('dateDiffDateUTCGetUTC', dateDiffDateUTCGetUTC);

    // let stringImplementation  = new Date(dateDiff.toUTCString().substr(0, 25));
    // console.log('stringImplementation', stringImplementation);


    return dateDiffDateUTC;
   
  }


  //#endregion

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
