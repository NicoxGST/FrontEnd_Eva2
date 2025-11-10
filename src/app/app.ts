import { Component, signal, Renderer2, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './component/header/header';
import { SidebarComponent } from './component/sidebar/sidebar';
import { FooterComponent } from './component/footer/footer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected readonly title = signal('Proyecto_CGE');

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const theme = savedTheme ?? 'light';
    this.renderer.addClass(document.body, `${theme}-theme`);
  }

  closeSidebar(): void {
    document.body.classList.remove('sidebar-open');
  }
}
