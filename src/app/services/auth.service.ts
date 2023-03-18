import { Injectable } from '@angular/core'; 
import { User } from '../models/user';
 
@Injectable({ 
    providedIn: 'root' 
}) 
export class AuthService { 

    setAuthToken(data: string) {
      localStorage.setItem('auth_token', data); 
    } 

    removeAuthToken() {
      localStorage.removeItem('auth_token');
    }
 
    getAuthToken(): string | null { 
      return localStorage.getItem('auth_token'); 
    } 

    setUserToken(user: User) {
      localStorage.setItem('loggedInUser', JSON.stringify(user)); 
    }
    
    removeUserToken() {
      localStorage.removeItem('loggedInUser');
    }
 
    getUserToken(): string | null { 
      return localStorage.getItem('loggedInUser');
    } 
 
    clearStorage() { 
      localStorage.clear(); 
    } 

    constructor() { 
    } 
 
}