import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { MateriaPrima } from '../../models/materia-prima.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ProveedorAntofagasta } from '../../models/proveedorAntofagasta.model';

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
  selectedPlanta = 'taltal';
  materiasPrimas: any[] = [];
  isLoading = true;

  proveedoresAntofagasta: ProveedorAntofagasta[] = [];
  proveedorSeleccionado: number | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.apiService.getProveedoresAntofagasta().subscribe(
      (data: ProveedorAntofagasta[]) => {
        this.proveedoresAntofagasta = data;
      },
      (error) => {
        console.error('Error al obtener los proveedores de Antofagasta:', error);
        this.proveedoresAntofagasta = [];
      }
    );

    this.route.paramMap.subscribe((params) => {
      const planta = params.get('planta');
      if (planta) {
        this.selectedPlanta = planta;
        this.proveedorSeleccionado = null;
      }
      this.cargarMateriasPrimas(this.selectedPlanta);
    });

    this.apiService.getProveedoresAntofagasta().subscribe(
    (data: ProveedorAntofagasta[]) => {
      console.log('Proveedores recibidos:', data);
      console.log('Primer proveedor nombre:', data[0]?.nombre);
      this.proveedoresAntofagasta = data;
    },
    (error) => {
      console.error('Error al obtener los proveedores de Antofagasta:', error);
      this.proveedoresAntofagasta = [];
    }
  );
  }

  cargarMateriasPrimas(planta: string) {
    this.isLoading = true;

    if (planta === 'antofagasta' && !this.proveedorSeleccionado) {
      this.materiasPrimas = [];
      this.isLoading = false;
      return;
    }

    if (planta === 'antofagasta' && this.proveedorSeleccionado) {
      this.apiService.getMateriasPrimasAntofagasta(this.proveedorSeleccionado).subscribe(
        (data: any[]) => {
          this.materiasPrimas = data;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error al obtener los datos de Antofagasta:', error);
          this.materiasPrimas = [];
          this.isLoading = false;
        }
      );
    } else {
      this.apiService.getMateriasPrimas(planta).subscribe(
        (data: MateriaPrima[]) => {
          this.materiasPrimas = data;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error al obtener los datos:', error);
          this.materiasPrimas = [];
          this.isLoading = false;
        }
      );
    }
  }

  cambiarPlanta(planta: string) {
    this.selectedPlanta = planta;
    this.proveedorSeleccionado = null;
    this.router.navigate(['/materias-primas', planta]);
  }

  seleccionarProveedor(proveedorId: number) {
    this.proveedorSeleccionado = proveedorId;
    this.cargarMateriasPrimas(this.selectedPlanta);
  }

  irAEditarPrecio(materiaPrima: any) {
    if (this.selectedPlanta === 'antofagasta') {
      this.router.navigate(['/editar-precio-antofagasta'], {
        state: {
          producto: materiaPrima,
          planta: this.selectedPlanta,
          proveedor: this.proveedorSeleccionado
        },
      });
    } else {
      this.router.navigate(['/editar-precio'], {
        state: { producto: materiaPrima, planta: this.selectedPlanta },
      });
    }
  }

  getNombreProveedor(): string {
  const proveedor = this.proveedoresAntofagasta.find(p => p.idProveedor === this.proveedorSeleccionado);
  return proveedor ? proveedor.nombre : 'Seleccionar proveedor';  // Cambiar nombreProveedor por nombre
}

  getNombreProducto(materiaPrima: any): string {
    if (this.selectedPlanta === 'antofagasta') {
      return materiaPrima.nombre_producto || materiaPrima.nombre || 'N/A';
    }
    return materiaPrima.nombre || 'N/A';
  }
}
