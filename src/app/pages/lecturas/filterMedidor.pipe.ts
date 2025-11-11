import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterMedidor', standalone: true })
export class FilterMedidorPipe implements PipeTransform {
  transform(medidores: any[], filtro: string): any[] {
    if (!filtro?.trim()) return medidores;
    const f = filtro.trim().toLowerCase();
    return medidores.filter(m =>
      (m.codigo_medidor && m.codigo_medidor.toLowerCase().includes(f)) ||
      (m.nombre_razon && m.nombre_razon.toLowerCase().includes(f)) ||
      String(m.id_medidor).includes(f)
    );
  }
}
