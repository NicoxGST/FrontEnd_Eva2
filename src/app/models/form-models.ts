
export type UUID = string;

// --- Cliente ---
export interface ClienteCreate {
  rut: string;
  nombre_razon: string;
  email_contacto?: string | null;
  telefono?: string | null;
  direccion_facturacion?: string | null;
  estado?: string;
}

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

export interface ClienteUpdate {
  rut?: string;
  nombre_razon?: string;
  email_contacto?: string | null;
  telefono?: string | null;
  direccion_facturacion?: string | null;
  estado?: string;
}

// --- Medidor ---
export interface MedidorCreate {
  codigo_medidor: string;
  id_cliente: string;
  direccion_suministro?: string | null;
  estado?: string;
}

export interface MedidorRead {
  id_medidor: string;
  codigo_medidor: string;
  id_cliente: string;
  direccion_suministro?: string | null;
  estado: string;
  created_at: string;
  updated_at?: string | null;
}

export interface MedidorUpdate {
  codigo_medidor?: string;
  id_cliente?: string;
  direccion_suministro?: string | null;
  estado?: string;
}

// --- LecturaConsumo ---
export interface LecturaCreate {
  id_medidor: string;
  anio: number;
  mes: number;
  lectura_kwh: number;
  observacion?: string | null;
}

export interface LecturaRead {
  id_lectura: number;
  id_medidor: string;
  anio: number;
  mes: number;
  lectura_kwh: number;
  observacion?: string | null;
  created_at: string;
}

export interface LecturaUpdate {
  id_medidor?: string;
  anio?: number;
  mes?: number;
  lectura_kwh?: number;
  observacion?: string | null;
}

// --- Boleta ---
export interface BoletaCreate {
  id_cliente: string;
  anio: number;
  mes: number;
  kwh_total: number;
  tarifa_base: number;
  cargos: number;
  iva: number;
  total_pagar: number;
  estado?: string;
}

export interface BoletaRead {
  id_boleta: string;
  id_cliente: string;
  anio: number;
  mes: number;
  kwh_total: number;
  tarifa_base: number;
  cargos: number;
  iva: number;
  total_pagar: number;
  estado: string;
  created_at: string;
}

export interface BoletaUpdate {
  id_cliente?: string;
  anio?: number;
  mes?: number;
  kwh_total?: number;
  tarifa_base?: number;
  cargos?: number;
  iva?: number;
  total_pagar?: number;
  estado?: string;
}
