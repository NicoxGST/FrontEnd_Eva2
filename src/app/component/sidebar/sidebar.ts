import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {
  items = [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Clientes', route: '/clientes', icon: 'users' },
    { label: 'Medidores', route: '/medidores', icon: 'gauge' },
    { label: 'Lecturas', route: '/lecturas', icon: 'book' },
    { label: 'Boletas', route: '/boletas', icon: 'file' }
  ];

  // ✅ Cierra el sidebar al seleccionar una opción (solo en móvil)
  closeSidebar() {
    if (window.innerWidth <= 991) {
      document.body.classList.remove('sidebar-open');
    }
  }
}
