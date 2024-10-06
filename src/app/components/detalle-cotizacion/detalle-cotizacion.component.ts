import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PdfService } from '../../services/pdf-generator/pdf-service.service';

@Component({
  selector: 'app-detalle-cotizacion',
  templateUrl: './detalle-cotizacion.component.html',
  styleUrls: ['./detalle-cotizacion.component.css']
})
export class DetalleCotizacionComponent {
  @Input() data: any;
  @Output() cerrarDetallesEvent = new EventEmitter<void>();

  constructor(private pdfService: PdfService) {}

  generateQuotePdf() {
    const quoteData = {
      date: this.data.date,
      seller: this.data.seller,
      client: this.data.client,
      items: this.data.items,
      total: this.data.total,
      observations: this.data.observations
    };
    const fileName = this.data.nombre || 'cotizacion';
    this.pdfService.generateQuotePDF(quoteData, fileName);
  }

  cerrarDetalles() {
    this.cerrarDetallesEvent.emit(); // Emitir evento para cerrar detalles
  }
}
