import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seleccion-planta',
  templateUrl: './seleccion-planta.component.html',
  styleUrl: './seleccion-planta.component.css'
})
export class SeleccionPlantaComponent {
  constructor(private router: Router) {}

  logout() {
    // Lógica para cerrar sesión, como limpiar tokens, etc.
    // Luego redirigir al login
    this.router.navigate(['/login']);
  }
}
