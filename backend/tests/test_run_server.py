import pytest

from run_server import backend_port


def test_port_default(monkeypatch):
    monkeypatch.delenv("PESEBRERA3L_PORT", raising=False)
    assert backend_port() == 8000


def test_port_env_valido(monkeypatch):
    monkeypatch.setenv("PESEBRERA3L_PORT", "9000")
    assert backend_port() == 9000


def test_port_env_invalido(monkeypatch):
    monkeypatch.setenv("PESEBRERA3L_PORT", "no-numero")
    assert backend_port() == 8000


def test_port_fuera_de_rango(monkeypatch):
    monkeypatch.setenv("PESEBRERA3L_PORT", "70000")
    assert backend_port() == 8000