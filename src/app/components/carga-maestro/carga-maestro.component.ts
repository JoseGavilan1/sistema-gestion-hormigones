import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../../services/api/api.service';
import { Producto } from '../../models/producto.model';
import Swal from 'sweetalert2'; // Importa SweetAlert

@Component({
  selector: 'app-carga-maestro',
  templateUrl: './carga-maestro.component.html',
  styleUrls: ['./carga-maestro.component.css']
})
export class CargaMaestroComponent {
  plantas = [
    { id: 1, nombre: 'Planta Taltal' },
    { id: 2, nombre: 'Planta Mejillones' },
    { id: 3, nombre: 'Planta Antofagasta' },
    { id: 4, nombre: 'Planta Maria Elena' },
    { id: 5, nombre: 'Planta Calama' },
    { id: 6, nombre: 'Planta Tocopilla' }
  ];
  idPlanta: number = 1; // Planta seleccionada
  selectedFile: File | null = null; // Archivo seleccionado
  primeraFila: any[] = []; // Para almacenar la primera fila de datos a procesar

  constructor(private apiService: ApiService) {}

  // Método para manejar la selección del archivo
  onFileChange(event: any) {
    try {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file; // Guardar el archivo seleccionado
      } else {
        Swal.fire('Error', 'Por favor, selecciona un archivo.', 'error');
      }
    } catch (error) {
      console.error('Error al seleccionar el archivo:', error);
      Swal.fire('Error', 'Se produjo un error al seleccionar el archivo. Por favor, intenta nuevamente.', 'error');
    }
  }

  // Método para cargar datos desde el archivo seleccionado
  cargarDatos() {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Guardar la primera fila en primeraFila para mostrarla
        this.primeraFila = excelData[1]; // Almacena la primera fila (segunda fila en Excel)

        // Solo procesamos la primera fila (fila 2 del Excel, ya que la primera es la cabecera)
        this.procesarDatos(this.primeraFila); // Cambiamos para pasar solo la primera fila
      };
      reader.readAsArrayBuffer(this.selectedFile);
    } else {
      Swal.fire('Error', 'Por favor, selecciona un archivo para cargar.', 'error');
    }
  }

  // Método para procesar solo la primera fila del Excel
  procesarDatos(row: any[]) {
    // Comprobar que la fila tiene al menos 12 columnas
    if (row.length < 12) {
      console.error('Fila incompleta:', row);
      return; // Salir si falta información
    }

    // Reemplazar valores vacíos con 0
    for (let j = 0; j < row.length; j++) {
      if (row[j] === undefined || row[j] === null || row[j] === '') {
        row[j] = 0; // Asignar 0 si el valor está vacío
      }
    }

    const producto: Producto = {
      idProducto: 0, // Este campo se asigna después en el back-end
      numeroFormula: row[0], // FORMULA
      familia: row[0] < 2000 ? 1000 : 2000, // Lógica de asignación de familia
      descripcionATecnica: row[1] || 'Descripción técnica no proporcionada',
      insertDate: new Date()
    };

    console.log('Producto a crear:', producto);

    this.apiService.createProducto(producto).subscribe(
      (productoCreado) => {
        console.log('Producto creado:', productoCreado);
        Swal.fire('Éxito', 'Producto creado exitosamente.', 'success'); // Alerta de éxito
      },
      error => {
        console.error(`Error al crear el producto ${producto.numeroFormula}`, error);

        // Mostrar alerta de error si el producto ya está registrado
        if (error === 'El producto con este número de fórmula ya está registrado.') {
          Swal.fire('Error', 'El producto ya está registrado. Por favor, ingrese uno nuevo.', 'error');
        } else {
          Swal.fire('Error', `Error al crear el producto ${producto.numeroFormula}`, 'error');
        }
      }
    );
  }
}
