import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  isLoggingOut: boolean = false;

  constructor(private authService: AuthService) {}

  logout(): void {
    this.isLoggingOut = true;

    setTimeout(() => {
      this.authService.logout(); // Llama al servicio para cerrar sesión
      this.isLoggingOut = false;
    }, 1500); // Simulación de espera
  }
}
