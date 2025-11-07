import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-medidores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medidores.html',
  styleUrls: ['./medidores.scss']
})
export class MedidoresComponent implements OnInit {
  medidorForm!: FormGroup;
  medidores: any[] = [];
  editando = false;
  medidorEditadoId: number | null = null;

  // 🔹 Simulación de clientes (FK)
  clientes = [
    { id_cliente: 1, nombre: 'María González' },
    { id_cliente: 2, nombre: 'Carlos López' },
    { id_cliente: 3, nombre: 'Ana Rojas' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.medidorForm = this.fb.group({
      codigo_medidor: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9-]+$')]],
      id_cliente: ['', Validators.required],
      direccion_suministro: ['', Validators.required],
      estado: ['activo', Validators.required],
      created_at: [new Date().toISOString().substring(0, 10)],
      updated_at: [new Date().toISOString().substring(0, 10)]
    });
  }

  guardar(): void {
    if (this.medidorForm.invalid) {
      this.medidorForm.markAllAsTouched();
      return;
    }

    const formValue = this.medidorForm.value;

    if (this.editando && this.medidorEditadoId !== null) {
      const index = this.medidores.findIndex(m => m.id_medidor === this.medidorEditadoId);
      if (index !== -1) {
        this.medidores[index] = { ...formValue, id_medidor: this.medidorEditadoId };
      }
      this.editando = false;
      this.medidorEditadoId = null;
      alert('✏️ Medidor actualizado correctamente');
    } else {
      const nuevo = {
        ...formValue,
        id_medidor: this.medidores.length + 1
      };
      this.medidores.push(nuevo);
      alert('✅ Medidor agregado correctamente');
    }

    this.limpiar();
  }

  editar(medidor: any): void {
    this.medidorForm.patchValue(medidor);
    this.editando = true;
    this.medidorEditadoId = medidor.id_medidor;
  }

  eliminar(id: number): void {
    if (confirm('¿Seguro que deseas eliminar este medidor?')) {
      this.medidores = this.medidores.filter(m => m.id_medidor !== id);
    }
  }

  limpiar(): void {
    this.medidorForm.reset({
      estado: 'activo',
      created_at: new Date().toISOString().substring(0, 10),
      updated_at: new Date().toISOString().substring(0, 10)
    });
    this.editando = false;
    this.medidorEditadoId = null;
  }

  // ✅ Método seguro para obtener el nombre del cliente
  getClienteNombre(id_cliente: number): string {
    const cliente = this.clientes.find(c => c.id_cliente === id_cliente);
    return cliente ? cliente.nombre : '—';
  }
}
