import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Producto } from '../../models/producto.model';
import { Dosificacion } from '../../models/dosificacion.model';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

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
    idPlanta: 1, // Establece un valor predeterminado
    descripcion: 'N/A'
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
        // Asegúrate de que idDosificacion no sea null o undefined
        if (this.dosificacion.idDosificacion != null) {
            this.apiService.actualizarDosificacion(this.dosificacion.idDosificacion, this.dosificacion).subscribe(
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
        }
    } else {
        // Asegúrate de que idProducto y idPlanta sean válidos
        const idProducto = this.dosificacion.idProducto != null ? this.dosificacion.idProducto : 0; // Valor por defecto si es null
        const idPlanta = this.dosificacion.idPlanta != null ? this.dosificacion.idPlanta : 1; // Valor por defecto si es null

        this.apiService.obtenerDosificacion(idProducto).subscribe(
            (existingDosificacion) => {
                // Lógica para manejar la dosificación existente
                this.dosificacion = existingDosificacion;
                this.isUpdating = true;
            },
            error => {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo cargar la dosificación existente.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                });
            }
        );
    }
}

}
