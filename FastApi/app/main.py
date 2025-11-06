# ...existing code...
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from . import crud, schema, models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gestión de Clientes y Medidores", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Clientes CRUD
# -------------------------
@app.post("/api/clientes", response_model=schema.ClienteRead, status_code=status.HTTP_201_CREATED)
def create_cliente(cliente_in: schema.ClienteCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_cliente(db, cliente_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/clientes", response_model=List[schema.ClienteRead])
def list_clientes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_clientes(db, skip=skip, limit=limit)


@app.get("/api/clientes/{id_cliente}", response_model=schema.ClienteRead)
def get_cliente(id_cliente: str, db: Session = Depends(get_db)):
    obj = crud.get_cliente(db, id_cliente)
    if not obj:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return obj


@app.put("/api/clientes/{id_cliente}", response_model=schema.ClienteRead)
def update_cliente(id_cliente: str, data: dict, db: Session = Depends(get_db)):
    obj = crud.update_cliente(db, id_cliente, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return obj


@app.delete("/api/clientes/{id_cliente}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cliente(id_cliente: str, db: Session = Depends(get_db)):
    ok = crud.delete_cliente(db, id_cliente)
    if not ok:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return None


# -------------------------
# Medidores CRUD
# -------------------------
@app.post("/api/medidores", response_model=schema.MedidorRead, status_code=status.HTTP_201_CREATED)
def create_medidor(medidor_in: schema.MedidorCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_medidor(db, medidor_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/medidores", response_model=List[schema.MedidorRead])
def list_medidores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_medidores(db, skip=skip, limit=limit)


@app.get("/api/medidores/{id_medidor}", response_model=schema.MedidorRead)
def get_medidor(id_medidor: str, db: Session = Depends(get_db)):
    obj = crud.get_medidor(db, id_medidor)
    if not obj:
        raise HTTPException(status_code=404, detail="Medidor no encontrado")
    return obj


@app.put("/api/medidores/{id_medidor}", response_model=schema.MedidorRead)
def update_medidor(id_medidor: str, data: dict, db: Session = Depends(get_db)):
    obj = crud.update_medidor(db, id_medidor, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Medidor no encontrado")
    return obj


@app.delete("/api/medidores/{id_medidor}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medidor(id_medidor: str, db: Session = Depends(get_db)):
    ok = crud.delete_medidor(db, id_medidor)
    if not ok:
        raise HTTPException(status_code=404, detail="Medidor no encontrado")
    return None


# -------------------------
# Lecturas (crear / listar por medidor/mes)
# -------------------------
@app.post("/api/lecturas", response_model=schema.LecturaRead, status_code=status.HTTP_201_CREATED)
def create_lectura(lectura_in: schema.LecturaCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_lectura(db, lectura_in)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/lecturas/medidor/{id_medidor}", response_model=List[schema.LecturaRead])
def list_lecturas_by_medidor(id_medidor: str, anio: Optional[int] = None, mes: Optional[int] = None, db: Session = Depends(get_db)):
    return crud.list_lecturas_by_medidor(db, id_medidor, anio=anio, mes=mes)


@app.delete("/api/lecturas/{id_lectura}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lectura(id_lectura: int, db: Session = Depends(get_db)):
    ok = crud.delete_lectura(db, id_lectura)
    if not ok:
        raise HTTPException(status_code=404, detail="Lectura no encontrada")
    return None


# -------------------------
# Boletas (generar / listar)
# -------------------------
@app.post("/api/boletas/generate", response_model=schema.BoletaRead, status_code=status.HTTP_201_CREATED)
def generate_boleta(payload: dict, db: Session = Depends(get_db)):
    # espera payload con id_cliente, anio, mes
    try:
        id_cliente = payload["id_cliente"]
        anio = int(payload["anio"])
        mes = int(payload["mes"])
    except Exception:
        raise HTTPException(status_code=400, detail="Se requieren id_cliente, anio y mes")
    boleta = crud.generate_boleta(db, id_cliente, anio, mes)
    return boleta


@app.get("/api/boletas/cliente/{id_cliente}", response_model=List[schema.BoletaRead])
def list_boletas_by_cliente(id_cliente: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_boletas_by_cliente(db, id_cliente, skip=skip, limit=limit)


@app.get("/api/boletas/cliente/{id_cliente}/{anio}/{mes}", response_model=schema.BoletaRead)
def get_boleta_cliente_mes(id_cliente: str, anio: int, mes: int, db: Session = Depends(get_db)):
    b = crud.get_boleta_by_client_month(db, id_cliente, anio, mes)
    if not b:
        raise HTTPException(status_code=404, detail="Boleta no encontrada")
    return b


@app.delete("/api/boletas/{id_boleta}", status_code=status.HTTP_204_NO_CONTENT)
def delete_boleta(id_boleta: str, db: Session = Depends(get_db)):
    ok = crud.delete_boleta(db, id_boleta)
    if not ok:
        raise HTTPException(status_code=404, detail="Boleta no encontrada")
    return None


# -------------------------
# Correo (opción A: endpoint simulado)
# -------------------------
@app.post("/correo/boleta/{id_boleta}")
def send_boleta_email(id_boleta: str, db: Session = Depends(get_db)):
    boleta = db.get(models.Boleta, id_boleta)
    if not boleta:
        raise HTTPException(status_code=404, detail="Boleta no encontrada")
    cliente = db.get(models.Cliente, boleta.id_cliente)
    # aquí iría la lógica real de envío; devolvemos info mínima
    return {"ok": True, "to": cliente.email_contacto, "id_boleta": id_boleta}
# ...existing code...