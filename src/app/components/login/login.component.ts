import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  loginError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group({
      registerUsername: ['', [Validators.required]],
      registerPassword: ['', [Validators.required]],
    });
  }

  onLoginSubmit(): void {
    this.loginError = '';

    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;

      this.authService.login(email, password).subscribe({
        next: (isLoggedIn) => {
          if (isLoggedIn) {
            this.router.navigate(['/home']);
          } else {
            this.loginError = 'Usuario o contraseña incorrectos';
          }
        },
        error: () => {
          this.loginError = 'Ocurrió un error en la autenticación';
        },
      });
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      const username = this.registerForm.get('registerUsername')?.value;
      const password = this.registerForm.get('registerPassword')?.value;

      this.authService.register(username, password).subscribe({
        next: (response) => {
          if (response) {
            // Opcional: redirigir al login después de registrar
            this.router.navigate(['/login']);
          }
        },
        error: () => {
          // Manejar errores de registro aquí
          console.error('Error al registrar usuario');
        },
      });
    }
  }
}
