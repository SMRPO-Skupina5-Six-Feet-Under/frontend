import { ProjectParticipantsInput } from "./projectParticipantsInput";

export class Project{
  id: number;
  name: string;
  description: string;
  projectParticipants: ProjectParticipantsInput[] = [];


  //* polja na klientu
  developerParticipantUserNames: string [] = [];
  scrumMasterUserId: number;
  scrumMasterUserName: string;
  productOwnerUserId: number;
  productOwnerUserName: string;
}