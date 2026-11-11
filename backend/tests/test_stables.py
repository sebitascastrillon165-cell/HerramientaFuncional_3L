def _crear_pesebrera(client, nombre="Pesebrera 1", capacidad=2):
    response = client.post("/api/v1/pesebreras/", json={"nombre": nombre, "capacidad": capacidad})
    assert response.status_code == 201
    return response.json()


def test_crear_pesebrera_al_inicio_disponible(client):
    data = _crear_pesebrera(client)
    assert data["estado"] == "disponible"
    assert data["nombre"] == "Pesebrera 1"
    assert data["capacidad"] == 2


def test_listar_pesebreras(client):
    _crear_pesebrera(client)
    response = client.get("/api/v1/pesebreras/")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_pesebrera_llena_al_alcanzar_capacidad(client):
    _crear_pesebrera(client, "Pesebrera Llena", 1)
    response = client.post("/api/v1/montadores/", json={"nombre": "Montador Uno", "disponible": True})
    rider_id = response.json()["id"]
    animal = client.post(
        "/api/v1/animales/",
        json={"tipo": "caballo", "nombre": "Relin", "pesebrera_id": 1, "montador_id": rider_id, "estado": "asignado"},
    )
    assert animal.status_code == 201
    stalls = client.get("/api/v1/pesebreras/").json()
    assert stalls[0]["estado"] == "llena"


def test_crear_pesebrera_nombre_duplicado_falla(client):
    _crear_pesebrera(client, "Pesebrera 1")
    response = client.post("/api/v1/pesebreras/", json={"nombre": "Pesebrera 1", "capacidad": 1})
    assert response.status_code >= 400
def test_crear_pesebreras_por_cantidad(client):
    response = client.post(
        "/api/v1/pesebreras/", json={"nombre": "Box", "capacidad": 2, "cantidad": 20}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["total"] == 20
    assert len(data["creadas"]) == 20
    assert data["creadas"][0]["nombre"] == "Box 1"
    assert data["creadas"][-1]["nombre"] == "Box 20"
    assert data["creadas"][0]["capacidad"] == 2
    listed = client.get("/api/v1/pesebreras/").json()
    assert len(listed) == 20


def test_cantidad_fuera_de_rango_es_rechazada(client):
    response = client.post(
        "/api/v1/pesebreras/", json={"nombre": "Box", "capacidad": 1, "cantidad": 101}
    )
    assert response.status_code == 422


def test_lote_con_duplicados_no_deja_registros_parciales(client):
    _crear_pesebrera(client, "Box 2", 1)
    response = client.post(
        "/api/v1/pesebreras/", json={"nombre": "Box", "capacidad": 1, "cantidad": 3}
    )
    assert response.status_code == 409
    assert len(client.get("/api/v1/pesebreras/").json()) == 1


def test_eliminar_pesebrera_desasigna_animales(client):
    _crear_pesebrera(client, "Box Unico", 1)
    rider = client.post(
        "/api/v1/montadores/", json={"nombre": "Montador QA", "disponible": True}
    ).json()
    animal = client.post(
        "/api/v1/animales/",
        json={
            "tipo": "caballo",
            "nombre": "Relin",
            "pesebrera_id": 1,
            "montador_id": rider["id"],
            "estado": "asignado",
        },
    ).json()
    deleted = client.delete("/api/v1/pesebreras/1")
    assert deleted.status_code == 200
    animals = client.get("/api/v1/animales/").json()
    assert animals[0]["id"] == animal["id"]
    assert animals[0]["pesebrera_id"] is None
    assert animals[0]["estado"] == "disponible"
    assert client.get("/api/v1/pesebreras/").json() == []


def test_eliminar_pesebrera_inexistente_devuelve_404(client):
    assert client.delete("/api/v1/pesebreras/999").status_code == 404
