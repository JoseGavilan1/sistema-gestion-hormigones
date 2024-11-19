import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './services/auth.guard/auth.guard';
import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';
import { CosteoProductoComponent } from './components/costeo-producto/costeo-producto.component';

import { MateriaPrimaComponent } from './components/materia-prima/materia-prima.component';
import { EditarPreciosMateriasPrimasComponent } from './components/editar-precios-materias-primas/editar-precios-materias-primas.component';
import { MenuAreaTecnicaComponent } from './components/menu-area-tecnica/menu-area-tecnica.component';
import { NewProductAtComponent } from './components/new-product-at/new-product-at.component';
import { DosificacionComponent } from './components/dosificacion/dosificacion.component';
import { CargaMaestroComponent } from './components/carga-maestro/carga-maestro.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },

  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

  { path: 'cotizaciones', component: CotizacionesComponent },

  { path: 'costeo-producto', component: CosteoProductoComponent },

  { path: 'materias-primas/:planta', component: MateriaPrimaComponent },

  { path: 'editar-precio', component: EditarPreciosMateriasPrimasComponent },

  { path: 'menu-area-tecnica', component: MenuAreaTecnicaComponent },

  { path: 'nuevo-producto-at', component: NewProductAtComponent },

  { path: 'dosificacion', component: DosificacionComponent },

  { path: 'carga-maestro', component: CargaMaestroComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
