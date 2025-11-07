// typescript
// src/app/services/api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import type { ClienteCreate, ClienteRead } from '../models/registro.interface';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private base = `${environment.apiUrl.replace(/\/+$/, '')}/clientes`;

  constructor(private http: HttpClient) {}

  guardarCliente(cliente: ClienteCreate): Observable<ClienteRead> {
    return this.http.post<ClienteRead>(this.base, cliente);
  }

  obtenerClientes(): Observable<ClienteRead[]> {
    return this.http.get<ClienteRead[]>(this.base);
  }

  obtenerCliente(id: string | number): Observable<ClienteRead> {
    const safeId = encodeURIComponent(String(id));
    return this.http.get<ClienteRead>(`${this.base}/${safeId}`);
  }

  actualizarCliente(id: string | number, cliente: Partial<ClienteCreate>): Observable<ClienteRead> {
    const safeId = encodeURIComponent(String(id));
    return this.http.put<ClienteRead>(`${this.base}/${safeId}`, cliente);
  }

  eliminarCliente(id: string | number): Observable<void> {
    const safeId = encodeURIComponent(String(id));
    return this.http.delete<void>(`${this.base}/${safeId}`);
  }
}
