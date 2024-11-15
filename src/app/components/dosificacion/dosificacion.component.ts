import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Producto } from '../../models/producto.model';
import { Dosificacion } from '../../models/dosificacion.model';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dosificacion',
  templateUrl: './dosificacion.component.html',
  styleUrls: ['./dosificacion.component.css'],
})
export class DosificacionComponent implements OnInit {
  isUpdating = false;
  isCheckingExisting = false; // Nueva variable para controlar la verificación inicial
  ultimoProducto: Producto | null = null;
  dosificacion: Dosificacion = {
    idDosificacion: 0,
    idProducto: 0,
    cemento: 0,
    aguaTotal: 0,
    arena: 0,
    gravilla: 0,
    aditivo1: 0,
    aditivo2: 0,
    aditivo3: 0,
    aditivo4: 0,
    aditivo5: 0,
    idPlanta: 1, // Valor predeterminado
    descripcion: 'N/A',
  };

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.cargarUltimoProducto();
  }

  cargarUltimoProducto(): void {
    this.apiService.getUltimoProducto().subscribe(
      (producto) => {
        this.ultimoProducto = producto;
        if (this.ultimoProducto) {
          this.dosificacion.idProducto = this.ultimoProducto.numeroFormula;
        }
      },
      (error) => {
        console.error('Error al cargar el último producto:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.isUpdating) {
      // Si está en modo de actualización, actualiza directamente
      this.apiService
        .actualizarDosificacion(this.dosificacion.idProducto, this.dosificacion)
        .subscribe(
          () => {
            Swal.fire({
              title: '¡Actualización exitosa!',
              text: 'La dosificación se ha actualizado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            });
            this.isUpdating = false;
            this.isCheckingExisting = false;
          },
          (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar la dosificación.',
              icon: 'error',
              confirmButtonText: 'Cerrar',
            });
          }
        );
    } else if (!this.isCheckingExisting) {
      // Si no está en modo de actualización y no se ha verificado la existencia
      this.isCheckingExisting = true;
      this.apiService
        .getDosificacionByProducto(this.dosificacion.idProducto)
        .subscribe(
          (existingDosificacion) => {
            // Si existe, carga la dosificación para editar
            Swal.fire({
              title: 'Dosificación existente',
              text: '¿Deseas actualizar la dosificación existente o ingresar un nuevo producto?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Actualizar Dosificación',
              cancelButtonText: 'Ingresar Nuevo Producto',
            }).then((result) => {
              if (result.isConfirmed) {
                // Carga la dosificación existente y habilita el modo de actualización
                this.dosificacion = existingDosificacion;
                this.isUpdating = true;
              } else {
                this.router.navigate(['/nuevo-producto-at']);
              }
              this.isCheckingExisting = false; // Reinicia el estado
            });
          },
          (error) => {
            if (error.status === 404) {
              // Si no existe la dosificación, crea una nueva
              this.apiService.createDosificacion(this.dosificacion).subscribe(
                () => {
                  Swal.fire({
                    title: '¡Dosificación registrada!',
                    text: 'La dosificación se ha registrado correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                  });
                },
                (err) => {
                  Swal.fire({
                    title: 'Error',
                    text: 'No se pudo registrar la dosificación.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                  });
                }
              );
            }
          }
        );
    }
  }
}
