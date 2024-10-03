import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';


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

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
