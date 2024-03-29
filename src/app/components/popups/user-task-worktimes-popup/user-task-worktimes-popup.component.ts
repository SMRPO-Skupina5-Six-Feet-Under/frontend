import { Component, EventEmitter, Output } from '@angular/core';
import { Observable, concat, delay, map, tap } from 'rxjs';
import { Sprint } from 'src/app/models/sprint';
import { Task } from 'src/app/models/task';
import { WorkTime } from 'src/app/models/workTime';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-user-task-worktimes-popup',
  templateUrl: './user-task-worktimes-popup.component.html',
  styleUrls: ['./user-task-worktimes-popup.component.scss']
})
export class UserTaskWorktimesPopupComponent {

  @Output() workTimesUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();

  visible: boolean = false;
  showEmptyWorkTimes: boolean = false;
  activeSprint: Sprint;
  task: Task;
  currentUserId: number;
  workTimes: WorkTime[];
  readonly: boolean = true;

  display(inputTask: Task, inputActiveSprint: Sprint, inputCurrentUserId: number){
    this.task = null;
    this.workTimes = null;
    this.showEmptyWorkTimes = false;
    this.activeSprint = null;
    this.currentUserId = null;
    if(!inputTask || !inputActiveSprint || !inputCurrentUserId) return;

    this.task = inputTask;
    if(this.task.isDone || (this.task.assigneeUserId !== inputCurrentUserId || !this.task.hasAssigneeConfirmed))
      this.readonly = true;
    else
      this.readonly = false;
    this.activeSprint = inputActiveSprint;
    this.currentUserId = inputCurrentUserId;

    this.visible = true;

    this.loadMyWorkTimesForTask();
    
  }

  close(){
    this.visible = false;
  }

  save(){
    let requests: Observable<WorkTime>[] = [];
    for (const workTime of this.workTimes) {
      if(workTime.filler && 
        (workTime.timeDone == null || workTime.timeDone < 1))
        continue;
      else
      {
        // console.log("saving workTime: ", workTime);
        requests.push(this.taskService.saveWorkTime(workTime));
      }
      
    }

    concat(...requests).subscribe({
      // next: (workTime: WorkTime) => {
      //   console.log("workTime saved: ", workTime);
      // },
      complete: () => {
        this.workTimesUpdated.emit(true);
        this.close();
      }
    })

  }

  toggleShowEmptyWorkTimes(){
    this.showEmptyWorkTimes = !this.showEmptyWorkTimes;
    this.loadMyWorkTimesForTask();
  }


  constructor(
    private taskService: TaskService
  ) {}


  private loadMyWorkTimesForTask(){
    if(!this.task) return;

    this.taskService.loadMyWorkTimesTask(this.task).pipe(
      // map((workTimes: WorkTime[]) => {
      //   const mergedWorkTimes = [];

      // }),
      tap((workTimes: WorkTime[]) => {
        this.workTimes = workTimes;
        console.log("workTimes loaded: ", workTimes);
        
        if(this.showEmptyWorkTimes)
          this.fillWorkTimesWithEmpty();
      })
    ).subscribe();
  }

  private fillWorkTimesWithEmpty(){
    let startDate = new Date(this.activeSprint.startDate);
    if(this.workTimes && this.workTimes.length > 0){
      const earliestWorkTime: Date = new Date(this.workTimes[0].date);

      if(startDate.getTime() > earliestWorkTime.getTime())
        startDate = earliestWorkTime;
    }
    startDate.setHours(0,0,0,0);

    let endDate = new Date();
    endDate.setHours(0,0,0,0);
    
    let newWorkTimes = [];
    let currTimeEstimate = this.task.timeEstimate;
    while(startDate.getTime() <= endDate.getTime()){
      const workTime = this.workTimes.find(wt => {
        let wtDate = new Date(wt.date);
        wtDate.setHours(0,0,0,0);
        return wtDate.getTime() === startDate.getTime();
      });
      if(workTime){
        currTimeEstimate = workTime.timeRemainingEstimate;
        newWorkTimes.push(workTime);
      }
      else{
        let date = new Date(startDate);
        date.setHours(0,0,0,0);
        const newWorkTime: WorkTime = {
          ... new WorkTime(),
          date: date,
          taskId: this.task.id,
          userId: this.currentUserId,
          timeDone: 0,
          timeRemainingEstimate: currTimeEstimate,
          filler: true
        };
        newWorkTimes.push(newWorkTime);
      }



      startDate.setDate(startDate.getDate() + 1);
    }

    this.workTimes = newWorkTimes;
  }


}
