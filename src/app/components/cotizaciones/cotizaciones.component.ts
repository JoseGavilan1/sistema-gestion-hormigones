import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cotizaciones',
  templateUrl: './cotizaciones.component.html',
  styleUrls: ['./cotizaciones.component.css']
})
export class CotizacionesComponent {

  constructor(private router: Router){}
  logout() {
    // Lógica para cerrar sesión, como limpiar tokens, etc.
    // Luego redirigir al login
    this.router.navigate(['/login']);
  }
  cotizaciones = [
    {
      nombre: 'Cotización 1',
      date: '05/10/2024',
      seller: 'Vendedor A',
      client: 'Cliente 1',
      items: [
        { product: 'Producto 1', quantity: 1, price: 12345, total: 12345 }
      ],
      total: 12345,
      observations: 'Observaciones de la cotización 1'
    },
    {
      nombre: 'Cotización 2',
      date: '06/10/2024',
      seller: 'Vendedor B',
      client: 'Cliente 2',
      items: [
        { product: 'Producto 2', quantity: 2, price: 54321, total: 108642 }
      ],
      total: 108642,
      observations: 'Observaciones de la cotización 2'
    }
  ];

  cotizacionSeleccionada: any = null;

  verDetalles(cotizacion: any) {
    this.cotizacionSeleccionada = cotizacion;
  }
}
