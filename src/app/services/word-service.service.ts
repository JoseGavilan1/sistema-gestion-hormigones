import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(private http: HttpClient) {}

  generarCotizacionPdf(cliente: any, productos: any[], totales: any): void {
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
            const aspectRatio = img.width / img.height; // Relación de aspecto
            const maxWidth = 40; // Máximo ancho permitido
            const maxHeight = 40; // Máximo alto permitido
            let width = maxWidth;
            let height = maxHeight;

            if (aspectRatio > 1) {
              // Imagen horizontal
              height = maxWidth / aspectRatio;
            } else {
              // Imagen vertical o cuadrada
              width = maxHeight * aspectRatio;
            }

            // Agregar la imagen al PDF
            doc.addImage(imageBase64, 'PNG', 10, 10, width, height); // Ajusta posición y tamaño

            // Encabezado
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Constructora y Hormigones Copat Ltda.', 55, 30); // Desplaza hacia abajo el texto

            doc.setFontSize(12);
            doc.text(`Cotización Nº: ${totales.numeroCotizacion}`, 10, 60); // Desplaza hacia abajo
            doc.text(`Fecha: ${totales.fecha}`, 10, 68); // Desplaza hacia abajo

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
              startY: 85, // Ajusta la posición inicial de la tabla
              theme: 'plain',
              margin: { left: 10 },
            });

            // Tabla de productos
            doc.setFont('helvetica', 'bold');
            doc.text('Detalles de Productos:', 10, doc.previousAutoTable?.finalY + 10 || 60);

            autoTable(doc, {
              head: [['Cant.', 'Un. Med.', 'Descripción', 'Valor UF', 'Valor en CLP']],
              body: productos.map((p) => [
                p.cantidad,
                p.unMedida,
                p.descripcion,
                p.valorUF.toFixed(2),
                p.valorReferencia.toLocaleString(),
              ]),
              startY: doc.previousAutoTable?.finalY + 15 || 70,
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
