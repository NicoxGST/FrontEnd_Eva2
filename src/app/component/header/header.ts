import { Component, Renderer2, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private sidebarOpen = false;
  theme: 'light' | 'dark' = 'light';

  constructor(private renderer: Renderer2) {}

  // 🔹 Toggle Sidebar
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;

    if (this.sidebarOpen) {
      this.renderer.addClass(document.body, 'sidebar-open');
    } else {
      this.renderer.removeClass(document.body, 'sidebar-open');
    }
  }

  // 🔹 Toggle Tema (claro / oscuro)
  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    localStorage.setItem('theme', this.theme);
  }

  // 🔹 Aplica el tema seleccionado al <body>
  private applyTheme(): void {
    this.renderer.removeClass(document.body, 'light-theme');
    this.renderer.removeClass(document.body, 'dark-theme');
    this.renderer.addClass(document.body, `${this.theme}-theme`);
  }

  // 🔹 Al iniciar, carga el tema guardado
  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    this.theme = savedTheme ?? 'light';
    this.applyTheme();
  }

  // 🔹 Limpieza al destruir el componente
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'sidebar-open');
  }
}
