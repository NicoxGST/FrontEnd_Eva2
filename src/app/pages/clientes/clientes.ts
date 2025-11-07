
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClienteService } from '../../services/api';
import type { ClienteCreate, ClienteRead } from '../../models/registro.interface';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clientes.html',

  styleUrls: [`./clientes.scss`]
})
export class ClientesComponent implements OnInit {
  clienteForm: FormGroup;
  clientes: ClienteRead[] = [];
  loading = false;
  error: string | null = null;
  editingId: string | number | null = null;

  constructor(private fb: FormBuilder, private clienteService: ClienteService) {
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
    this.error = null;
    this.clienteService.obtenerClientes().subscribe({
      next: (list: ClienteRead[]) => this.clientes = list,
      error: () => this.error = 'No se pudieron cargar clientes',
      complete: () => this.loading = false
    });
  }

  guardar(): void {
    console.log('Datos enviados:', this.clienteForm.value);
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }
    // Aquí debe llamarse al servicio
    this.clienteService.guardarCliente(this.clienteForm.value).subscribe({
      next: (cliente) => {
        console.log('Cliente guardado:', cliente);
        this.clientes.unshift(cliente);
        this.limpiar();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        if (err.error && err.error.detail) {
          console.error('Detalle del error:', err.error.detail);
        }
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
    if (!confirm('¿Eliminar cliente?')) return;
    this.loading = true;
    this.clienteService.eliminarCliente(id).subscribe({
      next: () => this.clientes = this.clientes.filter(c => (c as any).id_cliente !== id),
      error: () => this.error = 'Error al eliminar cliente',
      complete: () => this.loading = false
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
    this.error = null;
  }
}
