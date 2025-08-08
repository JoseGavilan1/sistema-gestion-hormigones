import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  loginError: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group({
      registerUsername: ['', [Validators.required]],
      registerPassword: ['', [Validators.required]],
    });
  }

  onLoginSubmit(): void {
    this.loginError = '';
    this.isLoading = true;

    if (this.loginForm.valid) {
      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;

      this.authService.login(username, password).subscribe({
        next: (isLoggedIn) => {
          this.isLoading = false;
          if (isLoggedIn) {
            this.setUserRole();
            this.router.navigate(['/home']);
          } else {
            this.loginError = 'Usuario o contraseña incorrectos';
          }
        },
        error: () => {
          this.isLoading = false;
          this.loginError = 'Ocurrió un error en la autenticación';
        },
      });
    } else {
      this.isLoading = false;
    }
  }

  setUserRole() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log('Token decodificado:', decodedToken);

        const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

        if (role) {
          localStorage.setItem('role', role);
          console.log('Rol del usuario:', role);
        } else {
          console.error('No se encontró el rol en el token');
        }
      } catch (error) {
        console.error('Error decodificando el token:', error);
      }
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      const username = this.registerForm.get('registerUsername')?.value;
      const password = this.registerForm.get('registerPassword')?.value;

      this.authService.register(username, password).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/login']);
          }
        },
        error: () => {
          console.error('Error al registrar usuario');
        },
      });
    }
  }
}
