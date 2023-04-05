export class User{
  id: number;
  userName: string = ''
  firstName: string = ''
  lastName: string = ''
  email: string = ''
  isAdmin: boolean = false;
  password: string = ''
  permissions: string = ''
  lastLogin: Date;
}

export class UserCreate{
  userName: string = ''
  firstName: string = ''
  lastName: string = ''
  email: string = ''
  isAdmin: boolean = false;
  password: string = ''
  permissions: string = ''
}