import uuid
import enum
from datetime import datetime
from typing import List

from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
    Numeric,
    Text,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from .database import Base


class EstadoEnum(enum.Enum):
    activo = "activo"
    inactivo = "inactivo"


class BoletaEstado(enum.Enum):
    emitida = "emitida"
    enviada = "enviada"
    pagada = "pagada"
    anulada = "anulada"


class Cliente(Base):
    __tablename__ = "cliente"

    id_cliente = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rut = Column(String(20), unique=True, nullable=False)
    nombre_razon = Column(String(255), nullable=False)
    email_contacto = Column(String(255), nullable=True)
    telefono = Column(String(50), nullable=True)
    direccion_facturacion = Column(String(500), nullable=True)
    estado = Column(SAEnum(EstadoEnum), nullable=False, default=EstadoEnum.activo)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    medidores: List["Medidor"] = relationship("Medidor", back_populates="cliente", cascade="all, delete-orphan")
    boletas: List["Boleta"] = relationship("Boleta", back_populates="cliente", cascade="all, delete-orphan")


class Medidor(Base):
    __tablename__ = "medidor"

    id_medidor = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    codigo_medidor = Column(String(100), unique=True, nullable=False)
    id_cliente = Column(PG_UUID(as_uuid=True), ForeignKey("cliente.id_cliente", ondelete="CASCADE"), nullable=False)
    direccion_suministro = Column(String(500), nullable=True)
    estado = Column(SAEnum(EstadoEnum), nullable=False, default=EstadoEnum.activo)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    cliente = relationship("Cliente", back_populates="medidores")
    lecturas: List["LecturaConsumo"] = relationship("LecturaConsumo", back_populates="medidor", cascade="all, delete-orphan")


class LecturaConsumo(Base):
    __tablename__ = "lectura_consumo"
    __table_args__ = (
        UniqueConstraint("id_medidor", "anio", "mes", name="uix_medidor_anio_mes"),
        CheckConstraint("lectura_kwh >= 0", name="ck_lectura_kwh_non_negative"),
    )

    id_lectura = Column(Integer, primary_key=True, autoincrement=True)
    id_medidor = Column(PG_UUID(as_uuid=True), ForeignKey("medidor.id_medidor", ondelete="CASCADE"), nullable=False)
    anio = Column(Integer, nullable=False)  # YYYY
    mes = Column(Integer, nullable=False)   # 1-12
    lectura_kwh = Column(Integer, nullable=False)
    observacion = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relaciones
    medidor = relationship("Medidor", back_populates="lecturas")


class Boleta(Base):
    __tablename__ = "boleta"
    __table_args__ = (
        UniqueConstraint("id_cliente", "anio", "mes", name="uix_cliente_anio_mes"),
    )

    id_boleta = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_cliente = Column(PG_UUID(as_uuid=True), ForeignKey("cliente.id_cliente", ondelete="CASCADE"), nullable=False)
    anio = Column(Integer, nullable=False)
    mes = Column(Integer, nullable=False)
    kwh_total = Column(Numeric(12, 3), nullable=False, default=0)
    tarifa_base = Column(Numeric(12, 4), nullable=False, default=0)
    cargos = Column(Numeric(12, 4), nullable=False, default=0)
    iva = Column(Numeric(12, 4), nullable=False, default=0)
    total_pagar = Column(Numeric(12, 4), nullable=False, default=0)
    estado = Column(SAEnum(BoletaEstado), nullable=False, default=BoletaEstado.emitida)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

 
    cliente = relationship("Cliente", back_populates="boletas")
