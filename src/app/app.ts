import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './component/header/header';
import { SidebarComponent } from './component/sidebar/sidebar';
import { FooterComponent } from './component/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  // ✅ señal opcional para controlar título dinámico (puedes usarla si luego lo muestras en header)
  protected readonly title = signal('Proyecto_CGE');

  // ✅ Cierra el sidebar al hacer click en el overlay
  closeSidebar(): void {
    document.body.classList.remove('sidebar-open');
  }

  // ✅ (opcional pero recomendado) se asegura que el sidebar quede cerrado al recargar la app
  constructor() {
    document.body.classList.remove('sidebar-open');
  }
}
