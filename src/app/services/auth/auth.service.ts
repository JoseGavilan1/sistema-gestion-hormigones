import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs'; // Importar Observable y of
import { catchError, map } from 'rxjs/operators'; // Importar operadores

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://backendcopatapirest20241105111006.azurewebsites.net/api/auth'; // URL de tu API

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map(response => {
          if (response) {
            localStorage.setItem('currentUser', JSON.stringify(response));
            return true; // Retorna true si la autenticación es exitosa
          }
          return false; // Retorna false si la autenticación falla
        }),
        catchError(() => {
          return of(false); // Captura cualquier error y retorna false
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('currentUser') !== null;
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password })
      .pipe(
        catchError(error => {
          console.error('Error al registrar usuario:', error);
          return of(null); // Retorna null en caso de error
        })
      );
  }
}
