# ...existing code...
from typing import Optional
from pydantic import BaseModel, Field


# Cliente
class ClienteCreate(BaseModel):
    rut: str
    nombre_razon: str
    email_contacto: Optional[str] = None
    telefono: Optional[str] = None
    direccion_facturacion: Optional[str] = None
    estado: Optional[str] = "activo"


class ClienteRead(ClienteCreate):
    id_cliente: str
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        orm_mode = True


# Medidor
class MedidorCreate(BaseModel):
    codigo_medidor: str
    id_cliente: str
    direccion_suministro: Optional[str] = None
    estado: Optional[str] = "activo"


class MedidorRead(MedidorCreate):
    id_medidor: str
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        orm_mode = True


# LecturaConsumo
class LecturaCreate(BaseModel):
    id_medidor: str
    anio: int
    mes: int 
    lectura_kwh: int
    observacion: Optional[str] = None


class LecturaRead(LecturaCreate):
    id_lectura: int
    created_at: str

    class Config:
        orm_mode = True


# Boleta
class BoletaCreate(BaseModel):
    id_cliente: str
    anio: int
    mes: int
    kwh_total: int 
    tarifa_base: int
    cargos: int
    iva: int
    total_pagar: int
    estado: Optional[str] = "emitida"


class BoletaRead(BoletaCreate):
    id_boleta: str
    created_at: str

    class Config:
        orm_mode = True
