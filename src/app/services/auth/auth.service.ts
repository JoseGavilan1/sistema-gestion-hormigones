import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //private apiUrl = 'https://localhost:44364/api/auth';
  private apiUrl = 'https://backendcopat2025-gtc2ccgcd3h0ceg0.canadaeast-01.azurewebsites.net/api/auth'; 

  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map((response) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            return true;
          }
          return false;
        }),
        catchError(() => {
          return of(false);
        })
      );
  }


  getUserRole(): string {
    return localStorage.getItem('role') || '';
  }


  logout(): void {
    localStorage.removeItem('token');

    this.router.navigate(['/login']).then(() => {
      window.history.replaceState({}, '', '/login');
    });
  }


  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  register(username: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/register`, { username, password })
      .pipe(
        catchError((error) => {
          console.error('Error al registrar usuario:', error);
          return of(null);
        })
      );
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMINISTRADOR';
  }

  isComercial(): boolean {
    return this.getUserRole() === 'COMERCIAL';
  }

  isCalidad(): boolean {
    return this.getUserRole() === 'CALIDAD';
  }

  isVendedor(): boolean {
    return this.getUserRole() === 'VENDEDOR';
  }
}
