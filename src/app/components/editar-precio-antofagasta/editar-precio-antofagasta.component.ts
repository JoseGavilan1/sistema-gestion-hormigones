import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-editar-precio-antofagasta',
  templateUrl: './editar-precio-antofagasta.component.html',
  styleUrls: ['./editar-precio-antofagasta.component.css']
})
export class EditarPrecioAntofagastaComponent implements OnInit {
  producto: any;
  planta: string = '';
  proveedor: number | null = null;

  // Campos editables
  nombreProducto: string = '';
  precio: number = 0;

  isLoading: boolean = false;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.producto = navigation.extras.state['producto'];
      this.planta = navigation.extras.state['planta'];
      this.proveedor = navigation.extras.state['proveedor'];

      // Inicializar valores
      this.nombreProducto = this.producto.nombre || this.producto.nombre_producto || '';
      this.precio = this.producto.precio || 0;
    }
  }

  ngOnInit(): void {
    if (!this.producto) {
      this.router.navigate(['/materias-primas', 'antofagasta']);
    }
  }

  actualizarProducto(): void {
    if (!this.producto) return;

    this.isLoading = true;

    const updateData = {
      nombreProducto: this.nombreProducto,
      precio: this.precio
    };

    this.apiService.updateMateriaPrimaAntofagasta(this.producto.id, updateData)
      .subscribe({
        next: (response) => {
          console.log('Producto actualizado:', response);
          this.isLoading = false;
          this.router.navigate(['/materias-primas', this.planta]);
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          this.isLoading = false;
          // Aquí puedes mostrar un mensaje de error
          alert('Error al actualizar el producto. Por favor, intente nuevamente.');
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/materias-primas', this.planta]);
  }
}
