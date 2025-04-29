import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl =
    'https://apicopat2025-dtf6beakara2bbb6.brazilsouth-01.azurewebsites.net/api/auth'; // URL de tu API

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map((response) => {
          if (response) {
            localStorage.setItem('currentUser', JSON.stringify(response));
            return true;
          }
          return false;
        }),
        catchError(() => {
          return of(false);
        })
      );
  }

  logout(): void {
    // Eliminar datos de autenticación
    localStorage.removeItem('currentUser');

    // Redirigir al login y limpiar el historial
    this.router.navigate(['/login']).then(() => {
      window.history.replaceState({}, '', '/login');
    });
  }

  isLoggedIn(): boolean {
    // Verifica si el token de autenticación existe
    return localStorage.getItem('currentUser') !== null;
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
}
