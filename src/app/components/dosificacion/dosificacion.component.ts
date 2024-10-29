import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Producto } from '../../models/producto.model';
import { Dosificacion } from '../../models/dosificacion.model';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-dosificacion',
  templateUrl: './dosificacion.component.html',
  styleUrls: ['./dosificacion.component.css']
})
export class DosificacionComponent implements OnInit {

  isUpdating = false;
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
    descripcion: 'N/A'
  };

  constructor(private apiService: ApiService) {}

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
      this.apiService.updateDosificacion(this.dosificacion.idDosificacion, this.dosificacion).subscribe(
        () => {
          Swal.fire({
            title: '¡Actualización exitosa!',
            text: 'La dosificación se ha actualizado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.isUpdating = false;
        },
        error => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar la dosificación.',
            icon: 'error',
            confirmButtonText: 'Cerrar'
          });
        }
      );
    } else {
      this.apiService.createDosificacion(this.dosificacion).subscribe(
        response => {
          Swal.fire({
            title: '¡Éxito!',
            text: 'La dosificación se ha registrado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        },
        error => {
          if (error.status === 409) {
            Swal.fire({
              title: 'Dosificación existente',
              text: 'La dosificación para este producto ya existe. ¿Deseas actualizarla?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Actualizar',
              cancelButtonText: 'Cancelar'
            }).then(result => {
              if (result.isConfirmed) {
                this.apiService.getDosificacionByProducto(this.dosificacion.idProducto).subscribe(
                  existingDosificacion => {
                    this.dosificacion = existingDosificacion;
                    this.isUpdating = true;
                  }
                );
              }
            });
          }
        }
      );
    }
  }


}
