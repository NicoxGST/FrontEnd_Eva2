import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-lecturas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lecturas.html',
  styleUrls: ['./lecturas.scss']
})
export class LecturasComponent implements OnInit {
  lecturaForm: FormGroup;
  lecturas: any[] = [];
  editingId: number | null = null;
  loading = false;

  constructor(private fb: FormBuilder) {
    this.lecturaForm = this.fb.group({
      id_medidor: ['', Validators.required],
      fecha: ['', Validators.required],
      lectura_actual: ['', [Validators.required, Validators.min(0)]],
      observacion: ['']
    });
  }

  ngOnInit(): void {
    this.cargarLecturas();
  }

  cargarLecturas(): void {
    // Simulación temporal de datos
    this.lecturas = [
      { id_lectura: 1, id_medidor: 1001, fecha: '2025-11-01', lectura_actual: 123, observacion: 'Normal' },
      { id_lectura: 2, id_medidor: 1002, fecha: '2025-11-02', lectura_actual: 256, observacion: 'Alta lectura' }
    ];
  }

  guardar(): void {
    if (this.lecturaForm.invalid) {
      this.lecturaForm.markAllAsTouched();
      return;
    }

    const data = this.lecturaForm.value;
    if (this.editingId) {
      const idx = this.lecturas.findIndex(l => l.id_lectura === this.editingId);
      this.lecturas[idx] = { id_lectura: this.editingId, ...data };
      this.editingId = null;
    } else {
      const nuevoId = this.lecturas.length ? Math.max(...this.lecturas.map(l => l.id_lectura)) + 1 : 1;
      this.lecturas.unshift({ id_lectura: nuevoId, ...data });
    }

    this.limpiar();
  }

  editar(lectura: any): void {
    this.lecturaForm.patchValue(lectura);
    this.editingId = lectura.id_lectura;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: number): void {
    if (confirm('¿Deseas eliminar esta lectura?')) {
      this.lecturas = this.lecturas.filter(l => l.id_lectura !== id);
    }
  }

  limpiar(): void {
    this.lecturaForm.reset();
    this.editingId = null;
  }
}

