import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  logout() {
    // Lógica para cerrar sesión, como limpiar tokens, etc.
    // Luego redirigir al login
    this.router.navigate(['/login']);
  }
}
