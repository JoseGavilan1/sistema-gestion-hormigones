// costeo-producto.component.ts
import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-costeo-producto',
  templateUrl: './costeo-producto.component.html',
  styleUrls: ['./costeo-producto.component.css']
})
export class CosteoProductoComponent {

  datosExcel: any[] = [];

  constructor(private apiService: ApiService) {}

  // Método para manejar el cambio de archivo
  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      alert('Por favor, selecciona un solo archivo.');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      // Convertir la hoja de cálculo a un arreglo de datos, empezando desde la fila 3
      const allData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      this.datosExcel = allData.slice(2); // Omitir las primeras dos filas
      console.log('Datos leídos del Excel:', this.datosExcel);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  // Método para cargar los datos a la base de datos
  cargarDatos() {
    if (this.datosExcel.length === 0) {
      alert('Por favor, carga un archivo Excel primero.');
      return;
    }
  
    const datosProcesados = this.datosExcel.map((fila: any[]) => {
      return {
        n_formula: fila[0],
        nomenclatura: fila[1]
        // Asigna los valores según el formato de tus datos
      };
    });
  
    this.apiService.cargarDatos(datosProcesados).subscribe(
      (response: string) => {
        console.log('Respuesta del servidor:', response);
        alert('Datos cargados correctamente');
      },
      (error) => {
        console.error('Error al cargar los datos:', error);
        alert('Error al cargar los datos');
      }
    );
  }
}
