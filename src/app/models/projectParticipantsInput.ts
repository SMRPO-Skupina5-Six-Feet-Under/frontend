export class ProjectParticipantsInput{
  roleId: number;
  userId: number;



  //polja na klentu
  selected: boolean = false;
  username: string;
  projectOwner: boolean = false;
  scrumMaster: boolean = false;
  developer: boolean = true;
}