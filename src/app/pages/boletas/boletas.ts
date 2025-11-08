import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-boletas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './boletas.html',
  styleUrls: ['./boletas.scss']
})
export class BoletasComponent implements OnInit {
  boletaForm: FormGroup;
  boletas: any[] = [];
  editingId: number | null = null;

  constructor(private fb: FormBuilder) {
    this.boletaForm = this.fb.group({
      id_cliente: ['', Validators.required],
      id_medidor: ['', Validators.required],
      fecha_emision: ['', Validators.required],
      fecha_vencimiento: ['', Validators.required],
      consumo: ['', [Validators.required, Validators.min(1)]],
      total_pagar: ['', [Validators.required, Validators.min(0)]],
      estado_pago: ['pendiente', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarBoletas();
  }

  cargarBoletas(): void {
    // Datos simulados mientras no haya backend
    this.boletas = [
      {
        id_boleta: 1,
        id_cliente: 101,
        id_medidor: 1001,
        fecha_emision: '2025-11-01',
        fecha_vencimiento: '2025-11-15',
        consumo: 150,
        total_pagar: 18750,
        estado_pago: 'pagado'
      },
      {
        id_boleta: 2,
        id_cliente: 102,
        id_medidor: 1002,
        fecha_emision: '2025-11-02',
        fecha_vencimiento: '2025-11-16',
        consumo: 220,
        total_pagar: 27500,
        estado_pago: 'pendiente'
      }
    ];
  }

  guardar(): void {
    if (this.boletaForm.invalid) {
      this.boletaForm.markAllAsTouched();
      return;
    }

    const data = this.boletaForm.value;
    if (this.editingId) {
      const index = this.boletas.findIndex(b => b.id_boleta === this.editingId);
      this.boletas[index] = { id_boleta: this.editingId, ...data };
      this.editingId = null;
    } else {
      const nuevoId = this.boletas.length
        ? Math.max(...this.boletas.map(b => b.id_boleta)) + 1
        : 1;
      this.boletas.unshift({ id_boleta: nuevoId, ...data });
    }

    this.limpiar();
  }

  editar(boleta: any): void {
    this.boletaForm.patchValue(boleta);
    this.editingId = boleta.id_boleta;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar esta boleta?')) {
      this.boletas = this.boletas.filter(b => b.id_boleta !== id);
    }
  }

  limpiar(): void {
    this.boletaForm.reset({
      estado_pago: 'pendiente'
    });
    this.editingId = null;
  }
}
