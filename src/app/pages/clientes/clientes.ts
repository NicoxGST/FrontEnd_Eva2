import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/api';
import type { ClienteRead } from '../../models/registro.interface';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss']
})
export class ClientesComponent implements OnInit {
  guardarFiltro(valor: string): void {
    localStorage.setItem('clientesFiltro', valor);
    if (valor.length >= 1) {
      let filtros: string[] = [];
      try {
        filtros = JSON.parse(localStorage.getItem('clientesFiltros') || '[]');
      } catch {}
      if (!filtros.includes(valor)) {
        filtros.push(valor);
        localStorage.setItem('clientesFiltros', JSON.stringify(filtros));
      }
    }
  }

  get sugerenciasFiltro(): string[] {
    let s: string[] = [];
    try {
      s = JSON.parse(localStorage.getItem('clientesFiltros') || '[]');
    } catch {}
    return s;
  }

  // Eliminado getter duplicado
  mostrarSugerencia(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.setAttribute('autocomplete', 'off');
    input.blur();
    setTimeout(() => input.focus(), 0);
  }
  get ultimoFiltro(): string | null {
    return localStorage.getItem('clientesFiltro');
  }
  mensaje: string = '';
  error: string = '';
  clienteForm: FormGroup;
  clientes: ClienteRead[] = [];
  // --- FILTRO Y PAGINACIÓN ---
  filtro: string = '';
  pageSize: number = 5;
  paginaActual: number = 1;
  loading: boolean = false;
  get clientesFiltrados(): ClienteRead[] {
    if (!this.filtro.trim()) return this.clientes;
    const f = this.filtro.trim().toLowerCase();
    return this.clientes.filter(c =>
      (c.rut && c.rut.toLowerCase().includes(f)) ||
      (c.nombre_razon && c.nombre_razon.toLowerCase().includes(f))
    );
  }
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.clientesFiltrados.length / this.pageSize));
  }
  editingId: string | number | null = null;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService
  ) {
    this.clienteForm = this.fb.group({
      rut: ['', [Validators.required, Validators.pattern(/^[0-9.\-kK]+$/)]],
      nombre_razon: ['', [Validators.required, Validators.minLength(3)]],
      email_contacto: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^\d{8,12}$/)]],
      direccion_facturacion: ['', Validators.required],
      estado: ['activo', Validators.required]
    });
  }

  get editando(): boolean {
    return this.editingId !== null;
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.error = '';
    this.clienteService.obtenerClientes().subscribe({
      next: (list: ClienteRead[]) => {
        this.clientes = list;
        this.paginaActual = 1;
      },
      error: () => this.error = 'No se pudieron cargar clientes',
      complete: () => this.loading = false
    });
  }

  guardar(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }
    this.clienteService.guardarCliente(this.clienteForm.value).subscribe({
      next: (cliente) => {
        this.clientes.unshift(cliente);
        this.mensaje = 'Cliente guardado correctamente.';
        this.error = '';
        this.limpiar();
      },
      error: (err) => {
        this.error = 'Error al guardar cliente.';
        this.mensaje = '';
      }
    });
  }

  editar(c: ClienteRead): void {
    this.editingId = (c as any).id_cliente;
    this.clienteForm.patchValue({
      rut: (c as any).rut ?? '',
      nombre_razon: (c as any).nombre_razon ?? '',
      email_contacto: (c as any).email_contacto ?? '',
      telefono: (c as any).telefono ?? '',
      direccion_facturacion: (c as any).direccion_facturacion ?? '',
      estado: (c as any).estado ?? 'activo'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: string | number): void {
    this.clienteService.eliminarCliente(id).subscribe({
      next: () => {
        this.mensaje = 'Cliente eliminado correctamente.';
        this.error = '';
        this.cargarClientes();
        this.limpiar();
        this.paginaActual = 1;
      },
      error: (err) => {
        this.error = 'No se pudo eliminar el cliente. '

        this.mensaje = '';
      }
    });
  }


  limpiar(): void {
    this.clienteForm.reset({
      rut: '',
      nombre_razon: '',
      email_contacto: '',
      telefono: '',
      direccion_facturacion: '',
      estado: 'activo'
    });
    this.editingId = null;
    this.filtro = '';
    this.paginaActual = 1;
  }
}
