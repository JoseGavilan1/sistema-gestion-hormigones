import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { ApiService } from './services/api/api.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SeleccionPlantaComponent } from './components/seleccion-planta/seleccion-planta.component';
import { Planta1Component } from './components/seleccion-planta/planta-1/planta-1.component';
import { Planta2Component } from './components/seleccion-planta/planta-2/planta-2.component';
import { Planta3Component } from './components/seleccion-planta/planta-3/planta-3.component';
import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';
import { CosteoProductoComponent } from './components/costeo-producto/costeo-producto.component';
import { DetalleCotizacionComponent } from './components/detalle-cotizacion/detalle-cotizacion.component';
import { NavbarComponent } from './components/navbar/navbar.component';
<<<<<<< Updated upstream
import { RouterModule } from '@angular/router';
=======
import { CosteoProductoMejillonesComponent } from './components/costeo-producto/costeo-producto-mejillones/costeo-producto-mejillones.component';
>>>>>>> Stashed changes


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SeleccionPlantaComponent,
    Planta1Component,
    Planta2Component,
    Planta3Component,
    CotizacionesComponent,
    CosteoProductoComponent,
    DetalleCotizacionComponent,
    NavbarComponent,
    CosteoProductoMejillonesComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule, 
    RouterModule

  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
