import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-planta-3',
  templateUrl: './planta-3.component.html',
  styleUrl: './planta-3.component.css'
})
export class Planta3Component {
  constructor(private router: Router) {}

  logout() {
    // Lógica para cerrar sesión, como limpiar tokens, etc.
    // Luego redirigir al login
    this.router.navigate(['/login']);
  }
}
