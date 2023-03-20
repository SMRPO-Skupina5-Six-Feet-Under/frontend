import { User } from "./user";

export class LogInData{
  userName: string;
  password: string;
}


export class LogInResponse{
  access_token: string;
  user: User;
}