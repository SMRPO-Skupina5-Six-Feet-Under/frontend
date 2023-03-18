import { User } from "./user";

export class LogInData{
  userName: string;
  password: string;
}


export class LogInResponse{
  token: string;
  user: User;
}