import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './services/auth.guard/auth.guard';
import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';
import { CosteoProductoComponent } from './components/costeo-producto/costeo-producto.component';
import { CosteoProductoMejillonesComponent } from './components/costeo-producto/costeo-producto-mejillones/costeo-producto-mejillones.component';

import { MateriaPrimaComponent } from './components/materia-prima/materia-prima.component';
import { EditarPreciosMateriasPrimasComponent } from './components/editar-precios-materias-primas/editar-precios-materias-primas.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent},

  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },


  {path: 'cotizaciones', component: CotizacionesComponent},

  {path: 'costeo-producto', component: CosteoProductoComponent},

  {path: 'costeo-mejillones', component: CosteoProductoMejillonesComponent},

  {path:'materias-primas', component: MateriaPrimaComponent},

  {path:'editar-precios-materias-primas/:planta', component: EditarPreciosMateriasPrimasComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
