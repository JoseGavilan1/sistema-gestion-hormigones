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
    Mejillones: [],
    Tocopilla: [],
    MariaElena: [],
    Calama: [],
    Antofagasta: []
  };


  ngOnInit(): void {
    this.apiService.getPreciosPorPlanta().subscribe(
      (response) => {
        // Verificar si los datos devueltos están organizados por planta
        if (response && response.Taltal && response.Mejillones) {
          this.datos.Taltal = response.Taltal;
          this.datos.Mejillones = response.Mejillones;
          this.datos.Tocopilla = response.Tocopilla;
          this.datos.MariaElena = response.MariaElena;
          this.datos.Calama = response.Calama;
          this.datos.Antofagasta = response.Antofagasta;
        } else {
          console.error('El formato de los datos no es el esperado.');
        }
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );

    console.log('Los datos de las materias primas es', this.datos)
  }


  logout() {
    // Lógica para cerrar sesión, como limpiar tokens, etc.
    // Luego redirigir al login
    this.router.navigate(['/login']);
  }
}
