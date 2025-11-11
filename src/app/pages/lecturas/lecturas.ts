import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FilterMedidorPipe } from './filterMedidor.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lecturas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FilterMedidorPipe],
  templateUrl: './lecturas.html',
  styleUrls: ['./lecturas.scss']
})
export class LecturasComponent implements OnInit {
  private apiUrl = 'http://localhost:8000/api';
  // Para mostrar el cálculo de kWh consumidos
  getLecturaAnterior(id_medidor: number, fecha: string): number | null {
    // Busca la lectura anterior para el mismo medidor y mes
    const lecturasMedidor = this.lecturas
      .filter(l => l.id_medidor === id_medidor && l.fecha < fecha)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    return lecturasMedidor.length ? lecturasMedidor[0].lectura_actual : null;
  }

  lecturaForm: FormGroup;
  lecturas: any[] = [];
  editingId: number | null = null;
  loading = false;
  medidores: any[] = [];
  filtroMedidor: string = '';
  lecturaAnterior: number | null = null;
  consumo: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.lecturaForm = this.fb.group({
      id_medidor: ['', Validators.required],
      fecha: ['', Validators.required],
      lectura_actual: ['', [Validators.required, Validators.min(0)]],
      observacion: ['']
    });
    // Actualizar lecturaAnterior y consumo cuando cambian medidor, fecha o lectura_actual
    this.lecturaForm.get('id_medidor')?.valueChanges.subscribe(() => this.actualizarLecturaAnteriorYConsumo());
    this.lecturaForm.get('fecha')?.valueChanges.subscribe(() => this.actualizarLecturaAnteriorYConsumo());
    this.lecturaForm.get('lectura_actual')?.valueChanges.subscribe(() => this.actualizarLecturaAnteriorYConsumo());
  }

  ngOnInit(): void {
    this.cargarLecturas();
    this.cargarMedidores();
  }

  cargarMedidores(): void {
    this.http.get<any[]>(`${this.apiUrl}/medidores`).subscribe({
      next: (data) => this.medidores = data,
      error: () => this.medidores = []
    });
  }

  cargarLecturas(): void {
    const id_medidor = this.lecturaForm.get('id_medidor')?.value;
    let url = `${this.apiUrl}/lecturas`;
    if (id_medidor) {
      url = `${this.apiUrl}/lecturas/medidor/${id_medidor}`;
    }
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        console.log('Lecturas recibidas:', data);
        this.lecturas = data;
        this.actualizarLecturaAnteriorYConsumo();
      },
      error: () => this.lecturas = []
    });
  }

  guardar(): void {
    if (this.lecturaForm.invalid) {
      this.lecturaForm.markAllAsTouched();
      return;
    }

    const data = this.lecturaForm.value;
    // Extraer año y mes de la fecha
    const fecha = data.fecha;
    const anio = fecha ? Number(fecha.slice(0, 4)) : null;
    const mes = fecha ? Number(fecha.slice(5, 7)) : null;
    // Validar que no exista ya una lectura para el mismo medidor en el mismo mes y año
    const existe = this.lecturas.some(l => l.id_medidor === data.id_medidor && l.anio === anio && l.mes === mes);
    if (existe && !this.editingId) {
      alert('Ya existe una lectura para este medidor en el mes seleccionado.');
      return;
    }
    // Calcular consumo
    const lecturaAnterior = this.lecturaAnterior ?? 0;
    const lecturaActual = Number(data.lectura_actual);
    const consumo = lecturaActual - lecturaAnterior;
    const payload = {
      id_medidor: data.id_medidor,
      anio,
      mes,
      lectura_actual: lecturaActual,
      lectura_anterior: lecturaAnterior,
      consumo,
      observacion: data.observacion
    };
    if (this.editingId) {
      this.http.put<any>(`${this.apiUrl}/lecturas/${this.editingId}`, payload).subscribe({
        next: () => {
          this.cargarLecturas();
          this.editingId = null;
          this.limpiar();
        },
        error: () => alert('Error al actualizar lectura')
      });
    } else {
      this.http.post<any>(`${this.apiUrl}/lecturas`, payload).subscribe({
        next: () => {
          this.cargarLecturas();
          this.limpiar();
        },
        error: () => alert('Error al registrar lectura')
      });
    }
    this.limpiar();
  }

  actualizarLecturaAnteriorYConsumo(): void {
    const id_medidor = this.lecturaForm.get('id_medidor')?.value;
    const fecha = this.lecturaForm.get('fecha')?.value;
    if (!id_medidor || !fecha) {
      this.lecturaAnterior = null;
      this.consumo = null;
      return;
    }
    // Buscar la lectura anterior (mes anterior)
    const anio = Number(fecha.slice(0, 4));
    const mes = Number(fecha.slice(5, 7));
    let anioAnterior = anio;
    let mesAnterior = mes - 1;
    if (mesAnterior === 0) {
      mesAnterior = 12;
      anioAnterior--;
    }
    const anterior = this.lecturas.find(l => l.id_medidor === id_medidor && l.anio === anioAnterior && l.mes === mesAnterior);
    this.lecturaAnterior = anterior ? Number(anterior.lectura_actual) : 0;
    const lecturaActual = Number(this.lecturaForm.get('lectura_actual')?.value);
    this.consumo = lecturaActual && this.lecturaAnterior !== null ? lecturaActual - this.lecturaAnterior : null;
  }

  editar(lectura: any): void {
    this.lecturaForm.patchValue(lectura);
    this.editingId = lectura.id_lectura;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: number): void {
    if (confirm('¿Deseas eliminar esta lectura?')) {
      this.http.delete(`${this.apiUrl}/lecturas/${id}`).subscribe({
        next: () => this.cargarLecturas(),
        error: () => alert('Error al eliminar lectura')
      });
    }
  }

  limpiar(): void {
    this.lecturaForm.reset();
    this.editingId = null;
  }
}

