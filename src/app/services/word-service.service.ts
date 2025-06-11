import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(private http: HttpClient) {}

  generarCotizacionPdf(cliente: any, productos: any[], totales: any, costosAdicionales: any): void {
    const doc = new jsPDF();

    // Cargar la imagen desde los assets
    this.http.get('assets/images/logo-copat.png', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const imageBase64 = reader.result as string;

          // Crear una etiqueta de imagen para obtener el tamaño real
          const img = new Image();
          img.src = imageBase64;
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            const maxWidth = 40;
            const maxHeight = 40;
            let width = maxWidth;
            let height = maxHeight;

            if (aspectRatio > 1) {
              height = maxWidth / aspectRatio;
            } else {
              width = maxHeight * aspectRatio;
            }

            // Agregar la imagen al PDF
            doc.addImage(imageBase64, 'PNG', 10, 10, width, height);

            // Encabezado
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Constructora y Hormigones Copat Ltda.', 55, 30);

            doc.setFontSize(12);
            doc.text(`Pre-Cotización Nº: ${totales.numeroCotizacion}`, 10, 60);
            doc.text(`Fecha: ${totales.fecha}`, 10, 68);

            // Información del cliente
            doc.setFont('helvetica', 'bold');
            doc.text('Datos del Cliente:', 10, 80);

            doc.setFont('helvetica', 'normal');
            const clienteData = [
              ['Nombre:', cliente.nombre],
              ['RUT:', cliente.rut],
              ['Dirección:', cliente.direccion],
              ['Ciudad:', `${cliente.ciudad}, ${cliente.comuna}`],
              ['Teléfono:', cliente.telefono],
              ['Email:', cliente.email],
              ['Vendedor:', cliente.vendedor],
            ];
            autoTable(doc, {
              body: clienteData,
              startY: 85,
              theme: 'plain',
              margin: { left: 10 },
            });

            // Detalles de costos adicionales
            doc.setFont('helvetica', 'bold');
            doc.text('Detalles de Costos:', 10, doc.previousAutoTable?.finalY + 10);

            const costosData = [
              ['Costo de Producción:', `${costosAdicionales.costoProduccion.toFixed(2)} UF`],
              ['Peaje (viajes x'+costosAdicionales.viajes+'):', `${costosAdicionales.peaje.toFixed(2)} UF`],
              ['Sobre Distancia:', `${costosAdicionales.sobreDistancia.toFixed(2)} UF`],
              ['Movilización:', `${costosAdicionales.movilizacion.toFixed(2)} UF`],
              ['Margen:', `${costosAdicionales.margen.toFixed(2)} UF`],
              ['Otros Costos:', `${costosAdicionales.otros.toFixed(2)} UF`],
            ];

            autoTable(doc, {
              body: costosData,
              startY: doc.previousAutoTable?.finalY + 15,
              theme: 'plain',
              margin: { left: 10 },
            });

            // Tabla de productos
            doc.setFont('helvetica', 'bold');
            doc.text('Detalles de Productos:', 10, doc.previousAutoTable?.finalY + 10);

            autoTable(doc, {
              head: [['Cant.', 'Un. Med.', 'Descripción', 'Valor UF', 'Valor en CLP']],
              body: productos.map((p) => [
                p.cantidad,
                p.unMedida,
                p.descripcion,
                p.valorUF.toFixed(2),
                p.valorReferencia.toLocaleString(),
              ]),
              startY: doc.previousAutoTable?.finalY + 15,
            });

            // Totales
            doc.setFont('helvetica', 'bold');
            doc.text('Totales:', 10, doc.previousAutoTable?.finalY + 10);

            const totalesData = [
              ['Sub Total en UF:', totales.uf.toFixed(2)],
              ['Sub Total en CLP:', totales.clp.toLocaleString()],
              ['IVA (19%):', totales.iva.toLocaleString()],
              ['Total Final en CLP:', totales.total.toLocaleString()],
            ];
            autoTable(doc, {
              body: totalesData,
              startY: doc.previousAutoTable?.finalY + 15,
              theme: 'plain',
              margin: { left: 10 },
            });

            // Notas
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text('Nota: Esta es una pre-cotización y no constituye un documento válido para efectos tributarios.',
                    10, doc.previousAutoTable?.finalY + 15);
            doc.text('Los valores están expresados en UF y su equivalente en pesos chilenos según valor UF del día.',
                    10, doc.previousAutoTable?.finalY + 20);

            // Guardar el archivo
            const fileName = `Pre-cotizacion-${totales.numeroCotizacion}.pdf`;
            doc.save(fileName);
          };
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('Error al cargar la imagen local:', err);
      },
    });
  }
}
