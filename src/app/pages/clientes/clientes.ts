import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss']
})
export class ClientesComponent implements OnInit {
  clienteForm!: FormGroup;
  clientes: any[] = [];
  editando = false;
  clienteEditadoId: number | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.clienteForm = this.fb.group({
      rut: ['', [Validators.required, this.validarRut]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email_contacto: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{8,12}$')]],
      direccion_facturacion: ['', [Validators.required]],
      estado: ['activo', Validators.required],
    });
  }

  validarRut(control: any) {
    const rut = control.value;
    if (!rut) return null;
    const regex = /^(\d{7,8}-[\dkK])$/;
    return regex.test(rut) ? null : { rutInvalido: true };
  }

  guardar(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    const formValue = this.clienteForm.value;

    if (this.editando && this.clienteEditadoId !== null) {
      // ✏️ Editar cliente existente
      const index = this.clientes.findIndex(c => c.id_cliente === this.clienteEditadoId);
      if (index !== -1) {
        this.clientes[index] = { ...formValue, id_cliente: this.clienteEditadoId };
      }
      this.editando = false;
      this.clienteEditadoId = null;
      alert('✏️ Cliente actualizado correctamente');
    } else {
      // 💾 Nuevo cliente
      const nuevoCliente = { ...formValue, id_cliente: this.clientes.length + 1 };
      this.clientes.push(nuevoCliente);
      alert('✅ Cliente registrado correctamente');
    }

    this.clienteForm.reset({ estado: 'activo' });
  }

  editar(cliente: any): void {
    this.editando = true;
    this.clienteEditadoId = cliente.id_cliente;
    this.clienteForm.patchValue(cliente);
  }

  eliminar(id: number): void {
    this.clientes = this.clientes.filter(c => c.id_cliente !== id);
  }

  limpiar(): void {
    this.clienteForm.reset({ estado: 'activo' });
    this.editando = false;
    this.clienteEditadoId = null;
  }
}
