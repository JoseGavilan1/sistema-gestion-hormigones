import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Producto } from '../../models/producto.model';
import { Dosificacion } from '../../models/dosificacion.model'; // Asegúrate de tener este modelo definido

@Component({
  selector: 'app-dosificacion',
  templateUrl: './dosificacion.component.html',
  styleUrls: ['./dosificacion.component.css']
})
export class DosificacionComponent implements OnInit {
  ultimoProducto: Producto | null = null; // Variable para almacenar el último producto
  dosificacion: Dosificacion = { // Modelo de dosificación inicial
    idProducto: 0, // Inicializa con un valor por defecto
    cemento: 0,
    aguaTotal: 0,
    arena: 0,
    gravilla: 0,
    aditivo1: null,
    aditivo2: null,
    aditivo3: null,
    aditivo4: null,
    aditivo5: null,
    descripcion: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarUltimoProducto();
  }

  cargarUltimoProducto(): void {
    this.apiService.getUltimoProducto().subscribe(
      (producto) => {
        this.ultimoProducto = producto; // Puede ser Producto o null
        if (this.ultimoProducto) {
          this.dosificacion.idProducto = this.ultimoProducto.numeroFormula; // Asigna el idProducto
        }
      },
      (error) => {
        console.error('Error al cargar el último producto:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.ultimoProducto) {
      // Ya tienes el idProducto en dosificacion
      this.apiService.createDosificacion(this.dosificacion).subscribe(
        response => {
          console.log('Dosificación registrada:', response);
          // Aquí puedes manejar la respuesta después de guardar la dosificación
        },
        error => {
          console.error('Error al registrar la dosificación:', error);
        }
      );
    }
  }
}
