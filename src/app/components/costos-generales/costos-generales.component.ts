import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiService } from '../../services/api/api.service';
import { CostoGeneral } from '../../models/costo-general.model';

@Component({
  selector: 'app-costos-generales',
  templateUrl: './costos-generales.component.html',
  styleUrl: './costos-generales.component.css'
})
export class CostosGeneralesComponent {
costos: CostoGeneral[] = [];
  nuevoCosto: CostoGeneral = { idCosto: 0, nombreCosto: '', valorCosto: 0 };
  costoEditando: CostoGeneral | null = null;
  mostrarFormulario = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarCostos();
  }

  cargarCostos(): void {
    this.apiService.getCostosGenerales().subscribe({
      next: (data) => {
        this.costos = data;
      },
      error: (err) => {
        this.mostrarError('Error al cargar costos generales');
      }
    });
  }

  crearCosto(): void {
    this.apiService.createCostosGenerales(this.nuevoCosto).subscribe({
      next: () => {
        this.cargarCostos();
        this.nuevoCosto = { idCosto: 0, nombreCosto: '', valorCosto: 0 };
        this.mostrarExito('Costo creado exitosamente');
      },
      error: (err) => {
        this.mostrarError('Error al crear costo');
      }
    });
  }

  editarCosto(costo: CostoGeneral): void {
    this.costoEditando = { ...costo };
    this.mostrarFormulario = true;
  }

  actualizarCosto(): void {
    if (this.costoEditando) {
      this.apiService.updateCostoGeneral(this.costoEditando.idCosto, this.costoEditando).subscribe({
        next: () => {
          this.cargarCostos();
          this.costoEditando = null;
          this.mostrarExito('Costo actualizado exitosamente');
          this.mostrarFormulario = false;
        },
        error: (err) => {
          this.mostrarError('Error al actualizar costo');
        }
      });
    }
  }

  eliminarCosto(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteCostoGeneral(id).subscribe({
          next: () => {
            this.cargarCostos();
            this.mostrarExito('Costo eliminado exitosamente');
          },
          error: (err) => {
            this.mostrarError('Error al eliminar costo');
          }
        });
      }
    });
  }

  cancelarEdicion(): void {
    this.costoEditando = null;
    this.mostrarFormulario = false;
  }

  private mostrarExito(mensaje: string): void {
    Swal.fire({
      icon: 'success',
      title: mensaje,
      timer: 1500,
      showConfirmButton: false
    });
  }

  private mostrarError(mensaje: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    });
  }
}
