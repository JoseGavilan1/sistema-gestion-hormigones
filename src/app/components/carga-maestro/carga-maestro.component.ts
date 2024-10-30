import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-carga-maestro',
  templateUrl: './carga-maestro.component.html',
  styleUrls: ['./carga-maestro.component.css']
})
export class CargaMaestroComponent {
  dosificacion: any = {};
  idProducto: number = 1000; // Número de fórmula especificado

  constructor(private apiService: ApiService) {}

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        this.extractDosificacionData(excelData);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  extractDosificacionData(excelData: any[]) {
    // Encuentra la fila correspondiente a la fórmula
    const formulaRow = excelData.find(row => row[0] === this.idProducto);
    if (formulaRow) {
      this.dosificacion = {
        IdProducto: formulaRow[0],
        Cemento: formulaRow[2],
        AguaTotal: formulaRow[3],
        Arena: formulaRow[4],
        Gravilla: formulaRow[5],
        Aditivo1: formulaRow[6],
        Aditivo2: formulaRow[7],
        Aditivo3: formulaRow[8],
        Aditivo4: formulaRow[9],
        Aditivo5: formulaRow[10],
        Descripcion: 'Dosificación cargada desde Excel'
      };
      this.cargarDosificacion();
    } else {
      alert('La fórmula número ' + this.idProducto + ' no se encuentra en el archivo.');
    }
  }

  cargarDosificacion() {
    // Verificar si existe una dosificación para el IdProducto
    this.apiService.obtenerDosificacion(this.dosificacion.IdProducto).subscribe(
      existingDosificacion => {
        if (existingDosificacion) {
          // Si ya existe, actualizar con los datos del Excel
          this.actualizarDosificacion(existingDosificacion.idDosificacion);
        } else {
          // Si no existe, crear una nueva dosificación
          this.crearDosificacion();
        }
      },
      error => {
        if (error.status === 404) {
          // Si no se encuentra (404), crear una nueva dosificación
          this.crearDosificacion();
        } else {
          alert('Error al verificar la existencia de la dosificación');
        }
      }
    );
  }

  crearDosificacion() {
    this.apiService.crearDosificacion(this.dosificacion).subscribe(
      () => {
        alert('Dosificación creada correctamente');
      },
      error => {
        alert('Error al crear la dosificación');
      }
    );
  }

  actualizarDosificacion(idDosificacion: number) {
    this.apiService.actualizarDosificacion(idDosificacion, this.dosificacion).subscribe(
      () => {
        alert('Dosificación actualizada correctamente');
      },
      error => {
        alert('Error al actualizar la dosificación');
      }
    );
  }
}
