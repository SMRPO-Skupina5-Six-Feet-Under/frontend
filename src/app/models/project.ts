import { ProjectParticipantsInput } from "./projectParticipantsInput";

export class Project{
  id: number;
  name: string = '';
  description: string = '';
  projectParticipants: ProjectParticipantsInput[] = [];
  documentation: string = '';


  //* polja na klientu
  developerParticipantUserNames: string [] = [];
  scrumMasterUserId: number;
  scrumMasterUserName: string;
  productOwnerUserId: number;
  productOwnerUserName: string;
  developerFullNamesIds: {id: number, fullName: string} [] = [];
}

export class ProjectDocumentation{
  text: string = '';
}