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