import { Injectable } from '@angular/core';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class WordService {
  constructor() {}

  generarCotizacionWord(cliente: any, productos: any[], totales: any): void {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Encabezado de la cotización
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Constructora y Hormigones Copat Ltda.',
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Cotización Nº: ${totales.numeroCotizacion}`, bold: true }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Fecha: ${totales.fecha}`, bold: true }),
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 200 },
            }),

            // Información del cliente
            new Paragraph({ text: 'Datos del Cliente:', heading: HeadingLevel.HEADING_2 }),
            new Table({
              rows: [
                this.createRow('Nombre:', cliente.nombre),
                this.createRow('RUT:', cliente.rut),
                this.createRow('Dirección:', cliente.direccion),
                this.createRow('Ciudad:', `${cliente.ciudad}, ${cliente.comuna}`),
                this.createRow('Teléfono:', cliente.telefono),
                this.createRow('Email:', cliente.email),
                this.createRow('Vendedor:', cliente.vendedor),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),

            new Paragraph({ text: '', spacing: { after: 300 } }),

            // Tabla de productos
            new Paragraph({ text: 'Detalles de Productos:', heading: HeadingLevel.HEADING_2 }),
            new Table({
              rows: [
                // Encabezados de la tabla
                new TableRow({
                  children: [
                    this.createCell('Cant.', true),
                    this.createCell('Un. Med.', true),
                    this.createCell('Descripción', true),
                    this.createCell('Valor UF', true),
                    this.createCell('Valor en CLP', true),
                  ],
                }),
                // Filas de productos
                ...productos.map((producto) =>
                  new TableRow({
                    children: [
                      this.createCell(producto.cantidad),
                      this.createCell(producto.unMedida),
                      this.createCell(producto.descripcion),
                      this.createCell(producto.valorUF),
                      this.createCell(producto.valorReferencia),
                    ],
                  })
                ),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),

            new Paragraph({ text: '', spacing: { after: 300 } }),

            // Totales
            new Table({
              rows: [
                this.createRow('Sub Total en UF:', totales.uf),
                this.createRow('Sub Total en CLP:', totales.clp),
                this.createRow('IVA (19%):', totales.iva),
                this.createRow('Total Final en CLP:', totales.total),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
              alignment: AlignmentType.RIGHT,
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'Cotizacion.docx');
    });
  }

  private createRow(label: string, value: string | number | undefined): TableRow {
    return new TableRow({
      children: [
        this.createCell(label, false, true),
        this.createCell(value !== undefined && value !== null ? value.toString() : '', false), // Validación añadida
      ],
    });
  }
  

  private createCell(text: string, isHeader: boolean = false, bold: boolean = false): TableCell {
    return new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold })],
          alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        }),
      ],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
      },
    });
  }
}
