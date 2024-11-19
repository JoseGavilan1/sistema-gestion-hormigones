import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service'; // Importa tu servicio API
import { MateriaPrima } from '../../models/materia-prima.model'; // Crea un modelo para MateriaPrima
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-materia-prima',
  templateUrl: './materia-prima.component.html',
  styleUrls: ['./materia-prima.component.css'],
})
export class MateriaPrimaComponent implements OnInit {
  plantas = [
    'taltal',
    'mejillones',
    'antofagasta',
    'maria-elena',
    'calama',
    'tocopilla',
  ];
  selectedPlanta = 'taltal'; // Planta por defecto
  materiasPrimas: MateriaPrima[] = [];
  isLoading = true;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el valor del parámetro "planta" desde la URL
    this.route.paramMap.subscribe((params) => {
      const planta = params.get('planta');
      if (planta) {
        this.selectedPlanta = planta; // Asigna la planta desde la URL
      }
      this.cargarMateriasPrimas(this.selectedPlanta); // Cargar las materias primas de la planta seleccionada
    });
  }

  cargarMateriasPrimas(planta: string) {
    this.isLoading = true;
    this.apiService.getMateriasPrimas(planta).subscribe(
      (data: MateriaPrima[]) => {
        this.materiasPrimas = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
        this.isLoading = false;
      }
    );
  }

  // Cambiar planta y redirigir a la ruta correspondiente
  cambiarPlanta(planta: string) {
    this.selectedPlanta = planta;
    this.router.navigate(['/materias-primas', planta]); // Navega a la nueva ruta con el parámetro planta
  }

  irAEditarPrecio(materiaPrima: MateriaPrima) {
    // Navegar al componente de edición de precios
    this.router.navigate(['/editar-precio'], {
      state: { producto: materiaPrima, planta: this.selectedPlanta },
    });
  }
}
