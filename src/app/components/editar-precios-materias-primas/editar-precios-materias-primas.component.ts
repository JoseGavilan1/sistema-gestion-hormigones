import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MateriaPrima } from '../../models/materia-prima.model';

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
  producto!: MateriaPrima;
  plantaSeleccionada!: string;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as NavigationState;

    this.producto = state?.producto;
    this.plantaSeleccionada = state?.planta;
  }

  ngOnInit(): void {
    if (!this.producto) {
      this.router.navigate(['/materias-primas']);
    }
  }

  guardarCambios() {
    console.log('Producto actualizado:', this.producto);
    this.router.navigate(['/materias-primas', this.plantaSeleccionada]);  // Redirigir usando el parámetro planta
  }

  cancelar() {
    this.router.navigate(['/materias-primas', this.plantaSeleccionada]);  // Redirigir usando el parámetro planta
  }
}
