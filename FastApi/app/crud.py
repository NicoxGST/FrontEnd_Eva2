# ...existing code...
from typing import List, Optional, Dict, Any

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from . import models, schema


# -------------------------
# Clientes
# -------------------------
def create_cliente(db: Session, cliente_in: schema.ClienteCreate) -> models.Cliente:
    obj = models.Cliente(**cliente_in.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_cliente(db: Session, id_cliente: str) -> Optional[models.Cliente]:
    return db.get(models.Cliente, id_cliente)


def list_clientes(db: Session, skip: int = 0, limit: int = 100) -> List[models.Cliente]:
    stmt = select(models.Cliente).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def update_cliente(db: Session, id_cliente: str, data: Dict[str, Any]) -> Optional[models.Cliente]:
    obj = get_cliente(db, id_cliente)
    if not obj:
        return None
    for k, v in data.items():
        if hasattr(obj, k):
            setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_cliente(db: Session, id_cliente: str) -> bool:
    obj = get_cliente(db, id_cliente)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


# -------------------------
# Medidores
# -------------------------
def create_medidor(db: Session, medidor_in: schema.MedidorCreate) -> models.Medidor:
    obj = models.Medidor(**medidor_in.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_medidor(db: Session, id_medidor: str) -> Optional[models.Medidor]:
    return db.get(models.Medidor, id_medidor)


def list_medidores(db: Session, skip: int = 0, limit: int = 100) -> List[models.Medidor]:
    stmt = select(models.Medidor).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def update_medidor(db: Session, id_medidor: str, data: Dict[str, Any]) -> Optional[models.Medidor]:
    obj = get_medidor(db, id_medidor)
    if not obj:
        return None
    for k, v in data.items():
        if hasattr(obj, k):
            setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_medidor(db: Session, id_medidor: str) -> bool:
    obj = get_medidor(db, id_medidor)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


# -------------------------
# Lecturas
# -------------------------
def create_lectura(db: Session, lectura_in: schema.LecturaCreate) -> models.LecturaConsumo:
    # valida que exista el medidor
    med = get_medidor(db, lectura_in.id_medidor)
    if not med:
        raise ValueError("medidor no existe")
    obj = models.LecturaConsumo(**lectura_in.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_lectura(db: Session, id_lectura: int) -> Optional[models.LecturaConsumo]:
    return db.get(models.LecturaConsumo, id_lectura)


def list_lecturas_by_medidor(db: Session, id_medidor: str, anio: Optional[int] = None, mes: Optional[int] = None) -> List[models.LecturaConsumo]:
    stmt = select(models.LecturaConsumo).where(models.LecturaConsumo.id_medidor == id_medidor)
    if anio is not None:
        stmt = stmt.where(models.LecturaConsumo.anio == anio)
    if mes is not None:
        stmt = stmt.where(models.LecturaConsumo.mes == mes)
    stmt = stmt.order_by(models.LecturaConsumo.anio, models.LecturaConsumo.mes, models.LecturaConsumo.id_lectura)
    return db.execute(stmt).scalars().all()


def delete_lectura(db: Session, id_lectura: int) -> bool:
    obj = get_lectura(db, id_lectura)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


# -------------------------
# Boletas
# -------------------------
def get_boleta_by_client_month(db: Session, id_cliente: str, anio: int, mes: int) -> Optional[models.Boleta]:
    stmt = select(models.Boleta).where(
        models.Boleta.id_cliente == id_cliente,
        models.Boleta.anio == anio,
        models.Boleta.mes == mes,
    )
    return db.execute(stmt).scalars().first()


def list_boletas_by_cliente(db: Session, id_cliente: str, skip: int = 0, limit: int = 100) -> List[models.Boleta]:
    stmt = select(models.Boleta).where(models.Boleta.id_cliente == id_cliente).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def generate_boleta(db: Session, id_cliente: str, anio: int, mes: int) -> models.Boleta:
    # si ya existe, devolvemos la existente
    existing = get_boleta_by_client_month(db, id_cliente, anio, mes)
    if existing:
        return existing

    # sumar lecturas de todos los medidores del cliente para el mes
    # SELECT SUM(lectura_kwh) FROM lectura_consumo JOIN medidor ON ... WHERE medidor.id_cliente = :id_cliente AND anio=:anio AND mes=:mes
    stmt_sum = select(func.coalesce(func.sum(models.LecturaConsumo.lectura_kwh), 0)).join(
        models.Medidor, models.LecturaConsumo.id_medidor == models.Medidor.id_medidor
    ).where(
        models.Medidor.id_cliente == id_cliente,
        models.LecturaConsumo.anio == anio,
        models.LecturaConsumo.mes == mes,
    )
    kwh_total = db.execute(stmt_sum).scalar_one()
    # crear boleta mínima; tarifas/cargos/iva deben calcularse según reglas del negocio (front/back)
    boleta_obj = models.Boleta(
        id_cliente=id_cliente,
        anio=anio,
        mes=mes,
        kwh_total=kwh_total,
        tarifa_base=0,
        cargos=0,
        iva=0,
        total_pagar=0,
        estado=models.BoletaEstado.emitida,
    )
    db.add(boleta_obj)
    db.commit()
    db.refresh(boleta_obj)
    return boleta_obj


def delete_boleta(db: Session, id_boleta: str) -> bool:
    obj = db.get(models.Boleta, id_boleta)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
