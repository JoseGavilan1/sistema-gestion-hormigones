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
  isLoading: boolean = false; // Estado para el spinner

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
    this.isLoading = true; // Mostrar spinner y mensaje

    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;

      this.authService.login(email, password).subscribe({
        next: (isLoggedIn) => {
          this.isLoading = false; // Ocultar spinner
          if (isLoggedIn) {
            this.router.navigate(['/home']);
          } else {
            this.loginError = 'Usuario o contraseña incorrectos';
          }
        },
        error: () => {
          this.isLoading = false; // Ocultar spinner
          this.loginError = 'Ocurrió un error en la autenticación';
        },
      });
    } else {
      this.isLoading = false; // Ocultar spinner si el formulario no es válido
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
