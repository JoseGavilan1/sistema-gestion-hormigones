import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-planta-2',
  templateUrl: './planta-2.component.html',
  styleUrl: './planta-2.component.css'
})
export class Planta2Component {
  constructor(private router: Router) {}

  logout() {
    // Lógica para cerrar sesión, como limpiar tokens, etc.
    // Luego redirigir al login
    this.router.navigate(['/login']);
  }
}
