import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true, // ✅ necesario para que Angular lo reconozca en otros componentes
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'] // ✅ plural y en arreglo
})
export class FooterComponent {} // ✅ nombre estandarizado con "Component"
