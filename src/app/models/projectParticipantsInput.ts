export class ProjectParticipantsInput{
  roleId: number;
  userId: number;



  //polja na klentu
  selected: boolean = false;
  username: string;
  productOwner: boolean = false;
  scrumMaster: boolean = false;
  developer: boolean = false;
}