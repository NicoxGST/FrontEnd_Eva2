
import type {
  ClienteRead,
  MedidorRead,
  LecturaRead,
  BoletaRead,
  UUID
} from './form-models';

export type { ClienteRead, MedidorRead, LecturaRead, BoletaRead, UUID };

export interface Cliente {
  registro: ClienteRead;
}

export interface Medidor {
  registro: MedidorRead;
}

export interface LecturaConsumo {
  registro: LecturaRead;
}

export interface Boleta {
  registro: BoletaRead;
}
