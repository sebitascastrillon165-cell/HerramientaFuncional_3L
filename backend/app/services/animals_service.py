from app.core.exceptions import StallFullError, ResourceNotFoundError
from app.services import queries, riders_service, stables_service


def list_animales(conn):
    rows = conn.execute(
        "SELECT id, tipo, nombre, raza, sexo, pesebrera_id, montador_id, estado, created_at, updated_at FROM animales ORDER BY id"
    ).fetchall()
    return [dict(row) for row in rows]


def get_animal(conn, animal_id):
    row = conn.execute(
        "SELECT id, tipo, nombre, raza, sexo, pesebrera_id, montador_id, estado, created_at, updated_at FROM animales WHERE id = ?",
        (animal_id,),
    ).fetchone()
    if row is None:
        raise ResourceNotFoundError("El animal indicado no existe.")
    return dict(row)


def create_animal(conn, payload):
    tipo = payload.get("tipo")
    nombre = payload.get("nombre")
    if tipo not in ("caballo", "mula"):
        raise ValueError("El tipo del animal debe ser caballo o mula.")
    pesebrera_id = payload.get("pesebrera_id")
    montador_id = payload.get("montador_id")
    if pesebrera_id is not None:
        pesebrera = stables_service.get_pesebrera(conn, pesebrera_id)
        if queries.count_assigned_animals(conn, pesebrera_id) >= pesebrera["capacidad"]:
            raise StallFullError("La pesebrera indicada se encuentra llena.")
    if montador_id is not None:
        riders_service.get_montador(conn, montador_id)
    estado = payload.get("estado") or ("asignado" if pesebrera_id is not None else "disponible")
    cursor = conn.execute(
        "INSERT INTO animales (tipo, nombre, raza, sexo, pesebrera_id, montador_id, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (tipo, nombre, payload.get("raza"), payload.get("sexo") or "macho", pesebrera_id, montador_id, estado),
    )
    if pesebrera_id is not None:
        stables_service.refresh_pesebrera_state(conn, pesebrera_id)
    conn.commit()
    return get_animal(conn, cursor.lastrowid)


def update_animal(conn, animal_id, payload):
    animal = get_animal(conn, animal_id)
    new_pesebrera_id = payload.get("pesebrera_id", animal["pesebrera_id"])
    new_montador_id = payload.get("montador_id", animal["montador_id"])
    if animal["pesebrera_id"] is not None and animal["estado"] == "asignado":
        stables_service.refresh_pesebrera_state(conn, animal["pesebrera_id"])
    if new_pesebrera_id is not None:
        pesebrera = stables_service.get_pesebrera(conn, new_pesebrera_id)
        if queries.count_assigned_animals(conn, new_pesebrera_id) >= pesebrera["capacidad"]:
            raise StallFullError("La pesebrera indicada se encuentra llena.")
    if new_montador_id is not None:
        riders_service.get_montador(conn, new_montador_id)
    conn.execute(
        "UPDATE animales SET tipo = ?, nombre = ?, raza = ?, sexo = ?, pesebrera_id = ?, montador_id = ?, estado = ? WHERE id = ?",
        (
            payload.get("tipo") or animal["tipo"],
            payload.get("nombre") or animal["nombre"],
            payload.get("raza") or animal["raza"],
            payload.get("sexo") or animal["sexo"],
            new_pesebrera_id,
            new_montador_id,
            payload.get("estado") or animal["estado"],
            animal_id,
        ),
    )
    if new_pesebrera_id is not None:
        stables_service.refresh_pesebrera_state(conn, new_pesebrera_id)
    conn.commit()
    return get_animal(conn, animal_id)


def delete_animal(conn, animal_id):
    animal = get_animal(conn, animal_id)
    pesebrera_id = animal["pesebrera_id"]
    conn.execute("DELETE FROM animales WHERE id = ?", (animal_id,))
    if pesebrera_id is not None:
        stables_service.refresh_pesebrera_state(conn, pesebrera_id)
    conn.commit()
    return {"status": "Eliminado"}