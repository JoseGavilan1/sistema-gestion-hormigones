import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MateriaPrima } from '../../models/materia-prima.model';
import { ApiService } from '../../services/api/api.service';
import Swal from 'sweetalert2'; // Importa SweetAlert2

interface NavigationState {
  producto: MateriaPrima;
  planta: string;
}

@Component({
  selector: 'app-editar-precios-materias-primas',
  templateUrl: './editar-precios-materias-primas.component.html',
  styleUrls: ['./editar-precios-materias-primas.component.css'],
})
export class EditarPreciosMateriasPrimasComponent implements OnInit {
  private plantasMap: { [key: string]: number } = {
    'Planta Taltal': 1,
    'Planta Mejillones': 2,
    'Planta Antofagasta': 3,
    'Planta Maria-elena': 4,
    'Planta Calama': 5,
    'Planta Tocopilla': 6,
  };

  producto!: MateriaPrima;
  plantaSeleccionada!: string;

  private adminPassword = 'admin123';

  constructor(private router: Router, private apiService: ApiService) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as NavigationState;

    this.producto = state?.producto;
    this.plantaSeleccionada = state?.planta;
    console.log(this.plantaSeleccionada);
  }

  ngOnInit(): void {
    if (!this.producto) {
      this.router.navigate(['/materias-primas']);
    }
  }

  guardarCambios() {
    // Solicitar la contraseña de administrador
    Swal.fire({
      title: 'Ingrese la contraseña de administrador',
      input: 'password',
      inputPlaceholder: 'Contraseña',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const password = result.value;

        // Verificar la contraseña
        if (password === this.adminPassword) {
          this.actualizarPrecio(); // Si la contraseña es correcta, actualizar el precio
        } else {
          Swal.fire({
            title: 'Contraseña Incorrecta',
            text: 'La contraseña ingresada es incorrecta.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      }
    });
  }

  private actualizarPrecio() {
    if (!this.producto || !this.plantaSeleccionada) {
      console.error('Faltan datos de producto o planta');
      return;
    }

    const normalizedPlantaSeleccionada = this.normalizePlanta(
      this.plantaSeleccionada
    );
    const plantaId = this.getPlantaId(normalizedPlantaSeleccionada);
    const productoId = this.producto.materiaPrimaId;
    const nuevoPrecio = this.producto.precio;

    this.apiService
      .actualizarPrecio(plantaId, productoId, nuevoPrecio)
      .subscribe({
        next: (response) => {
          if (typeof response === 'string') {
            console.log('Respuesta del servidor:', response);
          } else {
            console.log('Precio actualizado correctamente:', this.producto);
          }
          Swal.fire({
            title: 'Éxito',
            text: 'Precio actualizado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
          this.router.navigate(['/materias-primas', this.plantaSeleccionada]);
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el precio',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
          console.error('Error al actualizar el precio:', error);
        },
      });
  }

  private getPlantaId(plantaNombre: string): number {
    return this.plantasMap[plantaNombre] || 0;
  }

  private normalizePlanta(planta: string): string {
    return `Planta ${
      planta.charAt(0).toUpperCase() + planta.slice(1).toLowerCase()
    }`;
  }

  cancelar() {
    this.router.navigate(['/materias-primas', this.plantaSeleccionada]);
  }
}
