export class User{
  id: number;
  userName: string = ''
  firstName: string = ''
  lastName: string = ''
  email: string = ''
  isAdmin: boolean = false;
  password: string = ''
  lastLogin: Date;
  userDeleted: boolean = false;
}

export class UserCreate{
  userName: string = ''
  firstName: string = ''
  lastName: string = ''
  email: string = ''
  isAdmin: boolean = false;
  password: string = ''
}