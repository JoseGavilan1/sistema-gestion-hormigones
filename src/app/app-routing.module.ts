import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './services/auth.guard/auth.guard';
import { CosteoProductoComponent } from './components/costeo-producto/costeo-producto.component';

import { MateriaPrimaComponent } from './components/materia-prima/materia-prima.component';
import { EditarPreciosMateriasPrimasComponent } from './components/editar-precios-materias-primas/editar-precios-materias-primas.component';
import { MenuAreaTecnicaComponent } from './components/menu-area-tecnica/menu-area-tecnica.component';
import { NewProductAtComponent } from './components/new-product-at/new-product-at.component';
import { DosificacionComponent } from './components/dosificacion/dosificacion.component';
import { CargaMaestroComponent } from './components/carga-maestro/carga-maestro.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { CostosGeneralesComponent } from './components/costos-generales/costos-generales.component';
import { EditarPrecioAntofagastaComponent } from './components/editar-precio-antofagasta/editar-precio-antofagasta.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },

  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },


  { path: 'costeo-producto', component: CosteoProductoComponent , canActivate: [AuthGuard]},

  { path: 'materias-primas/:planta', component: MateriaPrimaComponent , canActivate: [AuthGuard]},

  { path: 'editar-precio', component: EditarPreciosMateriasPrimasComponent , canActivate: [AuthGuard]},

  { path: 'menu-area-tecnica', component: MenuAreaTecnicaComponent , canActivate: [AuthGuard]},

  { path: 'nuevo-producto-at', component: NewProductAtComponent, canActivate: [AuthGuard] },

  { path: 'dosificacion', component: DosificacionComponent , canActivate: [AuthGuard]},

  { path: 'carga-maestro', component: CargaMaestroComponent , canActivate: [AuthGuard]},

  {path: 'configuracion', component: ConfiguracionComponent, canActivate: [AuthGuard]},

  {path: 'costos-generales', component: CostosGeneralesComponent, canActivate: [AuthGuard]},

  {path: 'editar-precio-antofagasta', component: EditarPrecioAntofagastaComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
