export class WorkTime{
  id: number;
  taskId: number;
  userId: number;
  date: Date;
  timeDone: number;
  timeRemainingEstimate: number;


  //polja na klientu
  filler: boolean = false; // for days no time have been logged
}