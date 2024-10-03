import { Component } from '@angular/core';
import { BlobServiceClient } from '@azure/storage-blob';

@Component({
    selector: 'app-cotizaciones',
    templateUrl: './cotizaciones.component.html',
    styleUrls: ['./cotizaciones.component.css']
})
export class CotizacionesComponent {
    private connectionString = 'UseDevelopmentStorage=true';
    selectedFile: File | null = null;
    uploadSuccess = false;
    uploadMessage = '';

    constructor() {}

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
        this.uploadSuccess = false; // Reset success status when a new file is selected
    }

    async uploadFile() {
        if (this.selectedFile && this.selectedFile.type === 'application/pdf') {
            const blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
            const containerClient = blobServiceClient.getContainerClient('cotizaciones');
            const blobClient = containerClient.getBlockBlobClient(this.selectedFile.name);

            try {
                await blobClient.upload(this.selectedFile, this.selectedFile.size);
                this.uploadSuccess = true;
                this.uploadMessage = 'Archivo subido exitosamente';
            } catch (error) {
                console.error('Error al subir el archivo:', error);
                this.uploadSuccess = false;
                this.uploadMessage = 'Error al subir el archivo';
            }
        } else {
            console.error('Por favor, selecciona un archivo PDF válido.');
            this.uploadSuccess = false;
            this.uploadMessage = 'Por favor, selecciona un archivo PDF válido.';
        }
    }
}
