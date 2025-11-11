import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-boletas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './boletas.html',
  styleUrls: ['./boletas.scss']
})
export class BoletasComponent implements OnInit {
  descargarBoleta(id_boleta: string): void {
    this.http.get(`${this.apiUrl}/boletas/${id_boleta}/descargar`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `boleta_${id_boleta}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error = 'No se pudo descargar la boleta.';
      }
    });
  }
  getNombreCliente(id: string): string {
    const cliente = this.clientes.find(c => c.id_cliente === id);
    return cliente ? cliente.nombre_razon : id;
  }

  getCodigoMedidor(id: string): string {
    const medidor = this.medidoresCliente.find(m => m.id_medidor === id);
    return medidor ? medidor.codigo_medidor : id;
  }
  boletaForm: FormGroup;
  boletas: any[] = [];
  clientes: any[] = [];
  medidores: any[] = [];
  medidoresCliente: any[] = [];
  editingId: string | null = null;
  mensaje: string = '';
  error: string = '';
  mesesLectura: number[] = [];
  aniosLectura: number[] = [];
  lecturasMedidor: any[] = [];
  private apiUrl = 'http://localhost:8000/api';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.boletaForm = this.fb.group({
      id_cliente: ['', Validators.required],
      id_medidor: ['', Validators.required],
      anio: ['', Validators.required],
      mes: ['', Validators.required],
      kwh_total: ['', [Validators.required, Validators.min(0)]],
      valor_kwh: ['', [Validators.required, Validators.min(0)]],
      tarifa_base: [0, [Validators.required, Validators.min(0)]],
      cargos: [0, [Validators.required, Validators.min(0)]],
      iva: [{value: '', disabled: true}],
      total_pagar: [{value: '', disabled: true}],
      estado: ['emitida', Validators.required]
    });
    this.boletaForm.get('id_cliente')?.valueChanges.subscribe(id => this.filtrarMedidoresPorCliente(id));
    this.boletaForm.get('id_medidor')?.valueChanges.subscribe(id => this.cargarMesesLectura(id));
    this.boletaForm.get('anio')?.valueChanges.subscribe(() => this.actualizarConsumoAutomatico());
    this.boletaForm.get('mes')?.valueChanges.subscribe(() => this.actualizarConsumoAutomatico());
    this.boletaForm.get('kwh_total')?.valueChanges.subscribe(() => this.calcularTotalAutomatico());
    this.boletaForm.get('valor_kwh')?.valueChanges.subscribe(() => this.calcularTotalAutomatico());
    this.boletaForm.get('cargos')?.valueChanges.subscribe(() => this.calcularTotalAutomatico());
  }
  calcularTotalAutomatico(): void {
    const consumo = Number(this.boletaForm.get('kwh_total')?.value);
    const valorKwh = Number(this.boletaForm.get('valor_kwh')?.value);
    const cargos = Number(this.boletaForm.get('cargos')?.value);
    if (isNaN(consumo) || isNaN(valorKwh)) {
      this.boletaForm.get('iva')?.setValue('');
      this.boletaForm.get('total_pagar')?.setValue('');
      return;
    }
    const subtotal = consumo * valorKwh + (isNaN(cargos) ? 0 : cargos);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;
    this.boletaForm.get('iva')?.setValue(iva);
    this.boletaForm.get('total_pagar')?.setValue(total);
  }
  actualizarConsumoAutomatico(): void {
    const anio = Number(this.boletaForm.get('anio')?.value);
    const mes = Number(this.boletaForm.get('mes')?.value);
    if (!anio || !mes || !this.lecturasMedidor.length) {
      this.boletaForm.get('kwh_total')?.setValue(null);
      return;
    }
    const lectura = this.lecturasMedidor.find(l => Number(l.anio) === anio && Number(l.mes) === mes);
    if (lectura) {
      const valor = Number(lectura.consumo ?? lectura.kwh_total);
      this.boletaForm.get('kwh_total')?.setValue(isNaN(valor) ? null : valor);
    } else {
      this.boletaForm.get('kwh_total')?.setValue(null);
    }
  }

  ngOnInit(): void {
    this.cargarBoletas();
    this.cargarClientes();
    this.cargarMedidores();
  }

  cargarBoletas(): void {
    this.http.get<any[]>(`${this.apiUrl}/boletas`).subscribe({
      next: (data) => this.boletas = data,
      error: () => this.boletas = []
    });
  }

  cargarClientes(): void {
    this.http.get<any[]>(`${this.apiUrl}/clientes`).subscribe({
      next: (data) => this.clientes = data,
      error: () => this.clientes = []
    });
  }

  cargarMedidores(): void {
    this.http.get<any[]>(`${this.apiUrl}/medidores`).subscribe({
      next: (data) => this.medidores = data,
      error: () => this.medidores = []
    });
  }

  filtrarMedidoresPorCliente(id_cliente: string): void {
    this.medidoresCliente = this.medidores.filter(m => m.id_cliente === id_cliente);
    this.boletaForm.get('id_medidor')?.setValue('');
    this.mesesLectura = [];
    this.aniosLectura = [];
    this.lecturasMedidor = [];
  }

  cargarMesesLectura(id_medidor: string): void {
    if (!id_medidor) {
      this.mesesLectura = [];
      this.aniosLectura = [];
      this.lecturasMedidor = [];
      return;
    }
    this.http.get<any[]>(`${this.apiUrl}/lecturas/medidor/${id_medidor}`).subscribe({
      next: (data) => {
        this.lecturasMedidor = data;
        // Extraer años y meses únicos de las lecturas
        const anios = Array.from(new Set(data.map(l => l.anio)));
        const meses = Array.from(new Set(data.map(l => l.mes)));
        this.aniosLectura = anios.sort((a, b) => a - b);
        this.mesesLectura = meses.sort((a, b) => a - b);
      },
      error: () => {
        this.lecturasMedidor = [];
        this.mesesLectura = [];
        this.aniosLectura = [];
      }
    });
  }

  guardar(): void {
    if (this.boletaForm.invalid) {
      this.boletaForm.markAllAsTouched();
      return;
    }
    // Obtener todos los valores, incluidos los deshabilitados
    const form = { ...this.boletaForm.getRawValue() };
    // Validar y convertir todos los campos
    const payload = {
      id_cliente: form.id_cliente,
      anio: Number(form.anio) || 0,
      mes: Number(form.mes) || 0,
      kwh_total: form.kwh_total !== null && form.kwh_total !== '' ? Number(form.kwh_total) : 0,
      tarifa_base: form.valor_kwh !== null && form.valor_kwh !== '' ? Number(form.valor_kwh) : 0,
      cargos: form.cargos !== null && form.cargos !== '' ? Number(form.cargos) : 0,
      iva: form.iva !== null && form.iva !== '' ? Number(form.iva) : 0,
      total_pagar: form.total_pagar !== null && form.total_pagar !== '' ? Number(form.total_pagar) : 0,
      estado: (form.estado || '').toString().trim() === 'emitida' ? 'emitida' : 'emitida'
    };
    // Eliminar posibles campos undefined
    if (this.editingId) {
      this.http.put<any>(`${this.apiUrl}/boletas/${this.editingId}`, payload).subscribe({
        next: (res) => {
          this.mensaje = res?.mensaje || 'Boleta actualizada correctamente.';
          this.error = '';
          this.cargarBoletas();
          this.editingId = null;
          this.limpiar();
        },
        error: (err) => {
          this.error = err?.error?.detail || err?.message || 'Error al actualizar boleta.';
          this.mensaje = '';
        }
      });
    } else {
      this.http.post<any>(`${this.apiUrl}/boletas`, payload).subscribe({
        next: (res) => {
          this.mensaje = res?.mensaje || 'Boleta registrada correctamente.';
          this.error = '';
          this.cargarBoletas();
          this.limpiar();
        },
        error: (err) => {
          this.error = err?.error?.detail || err?.message || 'Error al registrar boleta.';
          this.mensaje = '';
        }
      });
    }
  }

  editar(boleta: any): void {
    this.boletaForm.patchValue(boleta);
    this.editingId = boleta.id_boleta;
    this.filtrarMedidoresPorCliente(boleta.id_cliente);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: string): void {
    if (confirm('¿Eliminar esta boleta?')) {
      this.http.delete(`${this.apiUrl}/boletas/${id}`).subscribe({
        next: () => {
          this.mensaje = 'Boleta eliminada correctamente.';
          this.cargarBoletas();
        },
        error: () => this.error = 'Error al eliminar boleta.'
      });
    }
  }

  limpiar(): void {
    this.boletaForm.reset({ estado: 'emitida' });
    this.editingId = null;
    this.mensaje = '';
    this.error = '';
    this.medidoresCliente = [];
  }
}
