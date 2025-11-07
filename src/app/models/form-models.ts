// src/app/models/form-models.ts
export type UUID = string;


export interface ClienteRead {
  id_cliente: UUID;
  rut: string;
  nombre_razon: string;
  email_contacto?: string | null;
  telefono?: string | null;
  direccion_facturacion?: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

''
export interface ClienteCreate {
  rut: string;
  nombre_razon: string;
  email_contacto?: string | null;
  telefono?: string | null;
  direccion_facturacion?: string | null;
  estado?: string;
}

3
export interface ClienteUpdate {
  rut?: string;
  nombre_razon?: string;
  email_contacto?: string | null;
  telefono?: string | null;
  direccion_facturacion?: string | null;
  estado?: string;
}
