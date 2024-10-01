import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private users = [
    { username: 'user1@gmail.com', password: 'password1' },
    { username: 'user2', password: 'password2' }
  ];

  constructor(private router: Router) { }

  login(username: string, password: string): boolean {
    const user = this.users.find(u => u.username === username && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user)); // Guardamos el usuario en localStorage
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem('currentUser'); // Limpiar sesión
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('currentUser') !== null;
  }
}
