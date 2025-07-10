import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { ApiService } from './services/api/api.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { CosteoProductoComponent } from './components/costeo-producto/costeo-producto.component';
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
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { CostosGeneralesComponent } from './components/costos-generales/costos-generales.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    CosteoProductoComponent,
    NavbarComponent,
    MateriaPrimaComponent,
    EditarPreciosMateriasPrimasComponent,
    MenuAreaTecnicaComponent,
    NewProductAtComponent,
    DosificacionComponent,
    CargaMaestroComponent,
    ConfiguracionComponent,
    CostosGeneralesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    MatProgressSpinnerModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
  ],
  providers: [ApiService, provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}
