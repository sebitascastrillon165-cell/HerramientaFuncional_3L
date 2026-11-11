def _crear_pesebrera(client, nombre="Pesebrera 1", capacidad=1):
    response = client.post("/api/v1/pesebreras/", json={"nombre": nombre, "capacidad": capacidad})
    assert response.status_code == 201
    return response.json()


def _crear_montador(client, nombre="Montador Uno"):
    response = client.post("/api/v1/montadores/", json={"nombre": nombre, "disponible": True})
    assert response.status_code == 200
    return response.json()


def test_crear_caballo(client):
    _crear_pesebrera(client)
    rider = _crear_montador(client)
    response = client.post(
        "/api/v1/animales/",
        json={"tipo": "caballo", "nombre": "Relin", "sexo": "macho", "pesebrera_id": 1, "montador_id": rider["id"], "estado": "asignado"},
    )
    assert response.status_code == 201
    assert response.json()["tipo"] == "caballo"


def test_crear_mula(client):
    _crear_pesebrera(client)
    rider = _crear_montador(client)
    response = client.post(
        "/api/v1/animales/",
        json={"tipo": "mula", "nombre": "Luna", "sexo": "hembra", "pesebrera_id": 1, "montador_id": rider["id"], "estado": "asignado"},
    )
    assert response.status_code == 201
    assert response.json()["tipo"] == "mula"


def test_asignar_a_pesebrera_llena_devuelve_409(client):
    _crear_pesebrera(client, "Pesebrera 1", 1)
    rider = _crear_montador(client)
    first = client.post(
        "/api/v1/animales/",
        json={"tipo": "caballo", "nombre": "Relin", "pesebrera_id": 1, "montador_id": rider["id"], "estado": "asignado"},
    )
    assert first.status_code == 201
    second = client.post(
        "/api/v1/animales/",
        json={"tipo": "mula", "nombre": "Luna", "pesebrera_id": 1, "montador_id": rider["id"], "estado": "asignado"},
    )
    assert second.status_code == 409


def test_pesebrera_inexistente_devuelve_error(client):
    rider = _crear_montador(client)
    response = client.post(
        "/api/v1/animales/",
        json={"tipo": "caballo", "nombre": "Relin", "pesebrera_id": 999, "montador_id": rider["id"], "estado": "asignado"},
    )
    assert response.status_code in (400, 404)


def test_actualizar_animal(client):
    _crear_pesebrera(client, "Pesebrera 1", 2)
    rider = _crear_montador(client)
    response = client.post(
        "/api/v1/animales/",
        json={"tipo": "caballo", "nombre": "Relin", "pesebrera_id": 1, "montador_id": rider["id"], "estado": "asignado"},
    )
    animal = response.json()
    updated = client.put(f"/api/v1/animales/{animal['id']}", json={"estado": "enfermo"})
    assert updated.status_code == 200
    assert updated.json()["estado"] == "enfermo"


def test_eliminar_animal(client):
    _crear_pesebrera(client)
    rider = _crear_montador(client)
    response = client.post(
        "/api/v1/animales/",
        json={"tipo": "caballo", "nombre": "Relin", "pesebrera_id": 1, "montador_id": rider["id"], "estado": "asignado"},
    )
    animal_id = response.json()["id"]
    deleted = client.delete(f"/api/v1/animales/{animal_id}")
    assert deleted.status_code == 200
    assert client.get("/api/v1/animales/").json() == []
def test_marcar_montador_no_disponible_al_asignar(client):
    _crear_pesebrera(client, capacidad=5)
    rider = _crear_montador(client)
    response = client.post(
        "/api/v1/animales/",
        json={
            "tipo": "caballo",
            "nombre": "Relin",
            "pesebrera_id": 1,
            "montador_id": rider["id"],
            "estado": "asignado",
            "montador_disponible": False,
        },
    )
    assert response.status_code == 201
    riders = client.get("/api/v1/montadores/").json()
    assert riders[0]["disponible"] in (0, False)
    assert riders[0]["carga_total"] == 1


def test_cambiar_disponibilidad_al_actualizar_animal(client):
    _crear_pesebrera(client, capacidad=5)
    rider = _crear_montador(client)
    animal = client.post(
        "/api/v1/animales/",
        json={
            "tipo": "mula",
            "nombre": "Luna",
            "pesebrera_id": 1,
            "montador_id": rider["id"],
            "estado": "asignado",
            "montador_disponible": False,
        },
    ).json()
    updated = client.put(
        f"/api/v1/animales/{animal['id']}", json={"montador_disponible": True}
    )
    assert updated.status_code == 200
    riders = client.get("/api/v1/montadores/").json()
    assert riders[0]["disponible"] in (1, True)


def test_listar_animales_incluye_nombres(client):
    _crear_pesebrera(client, "Pesebrera QA", 2)
    rider = _crear_montador(client, "Montador QA")
    client.post(
        "/api/v1/animales/",
        json={
            "tipo": "caballo",
            "nombre": "Relin",
            "pesebrera_id": 1,
            "montador_id": rider["id"],
            "estado": "asignado",
        },
    )
    animal = client.get("/api/v1/animales/").json()[0]
    assert animal["pesebrera_nombre"] == "Pesebrera QA"
    assert animal["montador_nombre"] == "Montador QA"
