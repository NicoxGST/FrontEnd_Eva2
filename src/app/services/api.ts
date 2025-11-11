// typescript
// src/app/services/api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../environments/environment';
import type { Cliente, ClienteRead } from '../models/registro.interface';
import { map, catchError } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class ClienteService {
  private base = `${environment.apiUrl.replace(/\/+$/, '')}/clientes`;

  constructor(private http: HttpClient) {}

  guardarCliente(cliente: Cliente): Observable<ClienteRead> {
    return this.http.post<ClienteRead>(this.base, cliente);
  }

  obtenerClientes(): Observable<ClienteRead[]> {
    return this.http.get<ClienteRead[]>(this.base);
  }

  obtenerCliente(id: string | number): Observable<ClienteRead> {
    const safeId = encodeURIComponent(String(id));
    return this.http.get<ClienteRead>(`${this.base}/${safeId}`);
  }

  actualizarCliente(id: string | number, cliente: Partial<Cliente>): Observable<ClienteRead> {
    const safeId = encodeURIComponent(String(id));
    return this.http.put<ClienteRead>(`${this.base}/${safeId}`, cliente);
  }

  eliminarCliente(id: string | number): Observable<void> {
    const safeId = encodeURIComponent(String(id));
    return this.http.delete<void>(`${this.base}/${safeId}`);
  }
  verificarAsociaciones(id: string | number): Observable<boolean> {
    return this.http.get<{ asociado: boolean }>(`/api/clientes/${id}/asociaciones`).pipe(
      map((res: { asociado: boolean }) => res.asociado),
      catchError(() => {
        // Opcional: puedes retornar false o lanzar el error
        return of(false);
      })
    );
  }
}
