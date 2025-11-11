import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  clientes: any[] = [];
  editando = false;
  medidorEditadoId: string | null = null;
  mensaje: string = '';
  error: string = '';

  private apiUrl = 'http://localhost:8000/api';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.medidorForm = this.fb.group({
      codigo_medidor: ['', Validators.required],
      id_cliente: ['', Validators.required],
      direccion_suministro: [''],
      estado: ['activo', Validators.required]
    });
    this.cargarClientes();
    this.cargarMedidores();
  }

  cargarClientes(): void {
    this.http.get<any[]>(`${this.apiUrl}/clientes`).subscribe({
      next: (data) => this.clientes = data,
      error: () => this.error = 'Error al cargar clientes.'
    });
  }

  cargarMedidores(): void {
    this.http.get<any[]>(`${this.apiUrl}/medidores`).subscribe({
      next: (data) => this.medidores = data,
      error: () => this.error = 'Error al cargar medidores.'
    });
  }
  guardar(): void {
    if (this.medidorForm.invalid) {
      this.error = 'Completa todos los campos obligatorios.';
      this.mensaje = '';
      return;
    }
    const datos = this.medidorForm.value;
    if (this.editando && this.medidorEditadoId) {
      this.http.put<any>(`${this.apiUrl}/medidores/${this.medidorEditadoId}`, datos).subscribe({
        next: () => {
          this.mensaje = 'Medidor actualizado correctamente.';
          this.error = '';
          this.cargarMedidores();
          this.limpiar();
        },
        error: (err) => {
          if (err.error?.detail?.includes('llave duplicada')) {
            this.error = 'El código de medidor ya existe.';
          } else {
            this.error = 'Error al actualizar medidor: ' + (err.error?.detail || err.message);
          }
          this.mensaje = '';
        }
      });
    } else {
      this.http.post<any>(`${this.apiUrl}/medidores`, datos).subscribe({
        next: () => {
          this.mensaje = 'Medidor registrado correctamente.';
          this.error = '';
          this.cargarMedidores();
          this.limpiar();
        },
        error: (err) => {
          if (err.error?.detail?.includes('llave duplicada')) {
            this.error = 'El código de medidor ya existe.';
          } else {
            this.error = 'Error al registrar medidor: ' + (err.error?.detail || err.message);
          }
          this.mensaje = '';
        }
      });
    }
  }



  editar(medidor: any): void {
    this.medidorForm.patchValue(medidor);
    this.editando = true;
    this.medidorEditadoId = medidor.id_medidor;
    this.mensaje = '';
    this.error = '';
  }

  eliminar(id: string): void {
    this.http.delete(`${this.apiUrl}/medidores/${id}`).subscribe({
      next: () => {
        this.mensaje = 'Medidor eliminado correctamente.';
        this.error = '';
        this.cargarMedidores();
        this.limpiar();
      },
      error: () => {
        this.error = 'Error al eliminar medidor.';
        this.mensaje = '';
      }
    });
  }

  limpiar(): void {
    this.medidorForm.reset({ estado: 'activo' });
    this.editando = false;
    this.medidorEditadoId = null;
    this.mensaje = '';
    this.error = '';
  }

  getClienteNombre(id_cliente: string): string {
    const cliente = this.clientes.find(c => c.id_cliente === id_cliente);
    return cliente ? cliente.nombre_razon : 'Desconocido';
  }

}
