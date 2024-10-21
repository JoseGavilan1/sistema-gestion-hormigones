import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './services/auth.guard/auth.guard';
import { SeleccionPlantaComponent } from './components/seleccion-planta/seleccion-planta.component';
import { Planta1Component } from './components/seleccion-planta/planta-1/planta-1.component';
import { Planta2Component } from './components/seleccion-planta/planta-2/planta-2.component';
import { Planta3Component } from './components/seleccion-planta/planta-3/planta-3.component';
import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';
import { CosteoProductoComponent } from './components/costeo-producto/costeo-producto.component';
import { CosteoProductoMejillonesComponent } from './components/costeo-producto/costeo-producto-mejillones/costeo-producto-mejillones.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent},

  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

  { path: 'plantas', component: SeleccionPlantaComponent},

  {path: 'planta1', component: Planta1Component},

  {path: 'planta2', component: Planta2Component},

  {path: 'planta3', component: Planta3Component},

  {path: 'cotizaciones', component: CotizacionesComponent},

  {path: 'costeo-producto', component: CosteoProductoComponent},

  {path: 'costeo-mejillones', component: CosteoProductoMejillonesComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
