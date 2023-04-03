import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { filter, tap } from 'rxjs';
import { Sprint } from 'src/app/models/sprint';
import { SprintService } from 'src/app/services/sprint.service';

@Component({
  selector: 'app-sprint-popup',
  templateUrl: './sprint-popup.component.html',
  styleUrls: ['./sprint-popup.component.scss']
})
export class SprintPopupComponent {
  @Output() sprintSaved: EventEmitter<Sprint> = new EventEmitter<Sprint>();
  //-- end of input/output

  sprint: Sprint;
  visible: boolean = false;
  startDate: string;
  endDate: string;


  display(sprint: Sprint){
    this.sprint = JSON.parse(JSON.stringify(sprint));
    if(this.sprint != null){
      if(this.sprint.startDate != null)
        this.startDate = this.datePipe.transform(this.sprint.startDate, 'yyyy-MM-dd');
      if(this.sprint.endDate != null)
        this.endDate = this.datePipe.transform(this.sprint.endDate, 'yyyy-MM-dd');

      this.visible = true;
    }
    else
      console.error("Sprint is null");
  }

  close(){
    this.visible = false;
  }


  save(){
    const dataOK: boolean = this.checkData();
    if(!dataOK)
      return;
    else{
      this.sprintService.saveSprint(JSON.parse(JSON.stringify(this.sprint))).pipe(
        filter(ss => ss != null),
        tap(savedSprint => {
          this.sprintSaved.emit(savedSprint);
          this.visible = false;
        })
      ).subscribe();
    }
  }

  private checkData(): boolean{
    this.sprint.startDate = new Date(this.startDate);
    this.sprint.endDate = new Date(this.endDate);
    if(this.sprint.velocity == null){
      this.toastr.error("Velocity is required");
      return false;
    }
    if(!Number.isInteger(this.sprint.velocity)){
      this.toastr.error("Velocity must be integer");
      return false;
    }
    if(this.sprint.velocity <= 0){
      this.toastr.error("Velocity must be positive");
      return false;
    }
    if(this.sprint.startDate == null){
      this.toastr.error("Start date is required");
      return false;
    }
    // if(this.sprint.startDate.) //! CHECK IF START DATE IN PAST AND END DATE IN PAST
    if(this.sprint.endDate == null){
      this.toastr.error("End date is required");
      return false;
    }
    if(this.sprint.startDate >= this.sprint.endDate){
      this.toastr.error("Start date must be before end date");
      return false;
    }
    const selectedStartDate = new Date(this.sprint.startDate);
    selectedStartDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    if(selectedStartDate < today){
      this.toastr.error("Start date must be in future");
      return false;
    }
    //check for velocity //max is 15 developers * 1,25 * 6 ~ 115 hours/day
    //so if the total number for velocity is more than number of days * 115 we won't let to save this sprint
    const startDate = new Date(this.sprint.startDate);
    const endDate = new Date(this.sprint.endDate);
    const diff = Math.abs(startDate.getTime() - endDate.getTime());
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24)); 
    if(this.sprint.velocity > diffDays * 115){
      this.toastr.error("Velocity is too high for this sprint)");
      console.error("15 developers * 1.25 * 6 ~ 115 hours/day")
      return false;
    }

    return true;
  }


  constructor(
    private toastr: ToastrService,
    private sprintService: SprintService,
    private datePipe: DatePipe
  ){

  }

}
