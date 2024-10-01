import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router'; // Para redireccionar después del login

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  loginError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,  // Inyectamos el servicio de autenticación
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      
      // Llamar al servicio de autenticación
      if (this.authService.login(email, password)) {
        this.router.navigate(['/home']);  // Redirigir al home si la autenticación es exitosa
      } else {
        this.loginError = 'Usuario o contraseña incorrectos';  // Mostrar error
      }
    }
  }
}
