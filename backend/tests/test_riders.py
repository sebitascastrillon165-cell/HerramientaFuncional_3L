def _crear_montador(client, nombre):
    response = client.post("/api/v1/montadores/", json={"nombre": nombre, "disponible": True})
    assert response.status_code == 200
    return response.json()


def _crear_pesebrera(client, nombre="Pesebrera 1", capacidad=10):
    response = client.post("/api/v1/pesebreras/", json={"nombre": nombre, "capacidad": capacidad})
    assert response.status_code == 201
    return response.json()


def test_crear_montador(client):
    data = _crear_montador(client, "Juan Perez")
    assert data["nombre"] == "Juan Perez"
    assert data["disponible"] in (0, 1, True)


def test_carga_de_montador(client):
    _crear_pesebrera(client)
    rider = _crear_montador(client, "Juan Perez")
    client.post(
        "/api/v1/animales/",
        json={"tipo": "caballo", "nombre": "Relin", "pesebrera_id": 1, "montador_id": rider["id"], "estado": "asignado"},
    )
    client.post(
        "/api/v1/animales/",
        json={"tipo": "mula", "nombre": "Luna", "pesebrera_id": 1, "montador_id": rider["id"], "estado": "asignado"},
    )
    riders = client.get("/api/v1/montadores/").json()
    assert riders[0]["caballos"] == 1
    assert riders[0]["mulas"] == 1
    assert riders[0]["carga_total"] == 2