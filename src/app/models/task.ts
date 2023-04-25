export class Task{
  id: number;
  name: string = '';
  description: string;
  timeEstimate: number; //in hours
  assigneeUserId: number;

  hasAssigneeConfirmed: boolean = false;
  isActive: boolean = false;
  isDone: boolean = false;
  storyId: number;


  //polja ni v bazi, pride iz serverja
  timeRemainingEstimate: number;

  //polja na klientu
  asigneeFullName: string;
  asigneeEditUserId: number;
}