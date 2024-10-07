import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-seleccion-planta',
  templateUrl: './seleccion-planta.component.html',
  styleUrl: './seleccion-planta.component.css'
})
export class SeleccionPlantaComponent {
  constructor(private router: Router,private apiService: ApiService) {}

  datos: any = {
    Taltal: [],
    Mejillones: []
  };


  ngOnInit(): void {
    this.apiService.getPreciosPorPlanta().subscribe(
      (response) => {
        this.datos = response; // Aquí se combinan los datos de ambas plantas
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }


  logout() {
    // Lógica para cerrar sesión, como limpiar tokens, etc.
    // Luego redirigir al login
    this.router.navigate(['/login']);
  }
}
