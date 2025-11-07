import { Component, Renderer2, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnDestroy {
  private sidebarOpen = false;

  constructor(private renderer: Renderer2) {}

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;

    if (this.sidebarOpen) {
      this.renderer.addClass(document.body, 'sidebar-open');
    } else {
      this.renderer.removeClass(document.body, 'sidebar-open');
    }
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'sidebar-open');
  }
}
