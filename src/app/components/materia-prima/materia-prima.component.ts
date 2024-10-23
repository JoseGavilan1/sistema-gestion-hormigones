import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service'; // Importa tu servicio API
import { MateriaPrima } from '../../models/materia-prima.model';// Crea un modelo para MateriaPrima
import { Router } from '@angular/router';

@Component({
  selector: 'app-materia-prima',
  templateUrl: './materia-prima.component.html',
  styleUrls: ['./materia-prima.component.css']
})
export class MateriaPrimaComponent implements OnInit {

  plantas = ['taltal', 'mejillones', 'antofagasta', 'maria-elena', 'calama', 'tocopilla'];
  selectedPlanta = 'taltal'; // Planta por defecto
  materiasPrimas: MateriaPrima[] = [];
  isLoading = true; // Para manejar el estado de carga

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    if (history.state.planta) {
      this.selectedPlanta = history.state.planta; // Asigna la planta seleccionada
    }
    this.cargarMateriasPrimas(this.selectedPlanta); // Cargar la planta por defecto al iniciar
  }

  cargarMateriasPrimas(planta: string) {
    this.isLoading = true; // Mostrar el spinner
    this.apiService.getMateriasPrimas(planta).subscribe(
      (data: MateriaPrima[]) => {
        this.materiasPrimas = data;
        this.isLoading = false; // Ocultar el spinner cuando los datos lleguen
      },
      error => {
        console.error('Error al obtener los datos:', error);
        this.isLoading = false; // Ocultar el spinner incluso en caso de error
      }
    );
  }

  // Cambiar planta y cargar sus datos
  cambiarPlanta(planta: string) {
    this.selectedPlanta = planta;
    this.cargarMateriasPrimas(planta); // Llamar al método para cargar datos de la planta seleccionada
  }

  irAEditarPrecios() {
    this.router.navigate(['/editar-precios-materias-primas', this.selectedPlanta], { state: { materiasPrimas: this.materiasPrimas } });
  }
}
