def test_dashboard_totales(client):
    client.post("/api/v1/pesebreras/", json={"nombre": "Pesebrera 1", "capacidad": 2})
    client.post("/api/v1/montadores/", json={"nombre": "Juan Perez", "disponible": True})
    client.post(
        "/api/v1/animales/",
        json={"tipo": "caballo", "nombre": "Relin", "pesebrera_id": 1, "montador_id": 1, "estado": "asignado"},
    )
    response = client.get("/api/v1/dashboard/")
    data = response.json()
    assert response.status_code == 200
    assert data["total_pesebreras"] == 1
    assert data["total_montadores"] == 1
    assert data["total_animales"] == 1
    assert data["caballos"] == 1
    assert data["mulas"] == 0
    assert data["montadores_activos"] == 1
    assert data["animales_por_pesebrera"][0]["animales"] == 1