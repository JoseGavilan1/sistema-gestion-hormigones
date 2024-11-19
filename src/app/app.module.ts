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
import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';
import { CosteoProductoComponent } from './components/costeo-producto/costeo-producto.component';
import { DetalleCotizacionComponent } from './components/detalle-cotizacion/detalle-cotizacion.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterModule } from '@angular/router';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MateriaPrimaComponent } from './components/materia-prima/materia-prima.component';
import { EditarPreciosMateriasPrimasComponent } from './components/editar-precios-materias-primas/editar-precios-materias-primas.component';
import { MenuAreaTecnicaComponent } from './components/menu-area-tecnica/menu-area-tecnica.component';
import { NewProductAtComponent } from './components/new-product-at/new-product-at.component';
import { DosificacionComponent } from './components/dosificacion/dosificacion.component';
import { CargaMaestroComponent } from './components/carga-maestro/carga-maestro.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    CotizacionesComponent,
    CosteoProductoComponent,
    DetalleCotizacionComponent,
    NavbarComponent,
    MateriaPrimaComponent,
    EditarPreciosMateriasPrimasComponent,
    MenuAreaTecnicaComponent,
    NewProductAtComponent,
    DosificacionComponent,
    CargaMaestroComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    MatProgressSpinnerModule,
  ],
  providers: [ApiService, provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}
