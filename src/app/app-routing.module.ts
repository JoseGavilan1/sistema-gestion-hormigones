import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './services/auth.guard/auth.guard';
import { SeleccionPlantaComponent } from './components/seleccion-planta/seleccion-planta.component';
import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';
import { CosteoProductoComponent } from './components/costeo-producto/costeo-producto.component';
import { CosteoProductoMejillonesComponent } from './components/costeo-producto/costeo-producto-mejillones/costeo-producto-mejillones.component';
import { PlantaMejillonesComponent } from './components/planta-mejillones/planta-mejillones.component';
import { PlantaTaltalComponent } from './components/planta-taltal/planta-taltal.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent},

  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

  { path: 'plantas', component: SeleccionPlantaComponent},

  {path: 'cotizaciones', component: CotizacionesComponent},

  {path: 'costeo-producto', component: CosteoProductoComponent},

  {path: 'costeo-mejillones', component: CosteoProductoMejillonesComponent},

  {path: 'm-primas-mejillones', component: PlantaMejillonesComponent},

  {path: 'm-primas-taltal', component: PlantaTaltalComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
