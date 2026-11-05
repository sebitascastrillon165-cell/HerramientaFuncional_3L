def test_crear_y_listar_tarifa(client):
    response = client.post("/api/v1/tarifas/", json={"nombre": "Hospedaje Caballo", "precio": 15000})
    assert response.status_code in (200, 201)
    tarifas = client.get("/api/v1/tarifas/").json()
    assert len(tarifas) == 1
    assert tarifas[0]["nombre"] == "Hospedaje Caballo"


def test_actualizar_tarifa(client):
    client.post("/api/v1/tarifas/", json={"nombre": "Hospedaje Caballo", "precio": 15000})
    response = client.put("/api/v1/tarifas/1", json={"id": 1, "nombre": "Hospedaje Caballo", "precio": 17000})
    assert response.status_code == 200
    tarifas = client.get("/api/v1/tarifas/").json()
    assert tarifas[0]["precio"] == 17000