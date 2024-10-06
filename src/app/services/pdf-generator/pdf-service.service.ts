import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  public generateQuotePDF(quoteData: any, fileName: string) {
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Título de Cotización
    pdf.setFontSize(22);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('PRE-COTIZACIÓN', 15, 20);

    // Información de la cotización (fecha, vendedor, cliente)
    pdf.setFontSize(12);
    pdf.setFont('Helvetica', 'normal');
    pdf.text(`FECHA:    ${quoteData.date}`, 15, 30);
    pdf.text(`VENDEDOR: ${quoteData.seller}`, 15, 37);
    pdf.text(`CLIENTE:  ${quoteData.client}`, 15, 44);

    // Tabla de Productos
    pdf.setFontSize(10);
    pdf.setFillColor(0, 0, 0); // Fondo negro para los encabezados
    pdf.setTextColor(255, 255, 255); // Texto blanco para los encabezados
    pdf.rect(15, 50, 180, 10, 'F'); // Encabezado de la tabla
    pdf.text('PRODUCTO', 20, 57);
    pdf.text('CANTIDAD', 90, 57);
    pdf.text('PRECIO', 130, 57);
    pdf.text('TOTAL', 170, 57);

    // Filas de productos
    let startY = 67;
    pdf.setTextColor(0, 0, 0); // Texto en negro para las filas
    quoteData.items.forEach((item: any) => {
      pdf.rect(15, startY, 180, 10); // Dibuja las celdas de la tabla
      pdf.text(item.product, 20, startY + 7);
      pdf.text(item.quantity.toString(), 100, startY + 7);
      pdf.text(`$${item.price}`, 130, startY + 7);
      pdf.text(`$${item.total}`, 170, startY + 7);
      startY += 10;
    });

    // Total de la Cotización
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Total', 150, startY + 10);
    pdf.text(`$${quoteData.total}`, 170, startY + 10);

    // Observaciones (dinámicas desde el componente)
    pdf.setFont('Helvetica', 'normal');
    let obsText = quoteData.observations || 'No hay observaciones';

    // Lógica para dividir el texto de las observaciones si es muy largo (automático)
    const splitObservations = pdf.splitTextToSize(obsText, 180);
    pdf.text(splitObservations, 15, startY + 30); // Ajustar la posición según la tabla


    // Pie de página
    pdf.setFontSize(10);
    pdf.text('Cotización válida por 30 días*', 15, 280);

    // Guarda el archivo PDF
    pdf.save(`${fileName}.pdf`);
  }
}
