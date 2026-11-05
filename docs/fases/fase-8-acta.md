# Fase 8 — Acta de Cierre: Empaquetado y Entrega

**Proyecto:** Pesebrera3L-Desk
**Estándar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-05

## 1. Resultado obtenido

Se construyó el núcleo backend congelado (`dist/pesebrera3l-backend.exe`, 18.0 MB) verificado con un
`PESEBRERA3L_DATA` temporal (health 200 OK, dashboard 200 OK). Se construyó el portable
(`release/Pesebrera3L-Desk-1.0.0-portable.exe`, ~128 MB). El paquete incluye `resources/backend/`
con el backend congelado y `app.asar` con el frontend/Electron main/preload.

## 2. Requisitos cumplidos y pendientes

- **Cumplidos:** Empaquetado nativo Windows (RNF-04); backend embebido en el paquete; respaldo automático al cierre (RNF-03).
- **Pendientes:** Prueba interactiva completa en un entorno con pantalla (ventana Electron + GUI).

## 3. Pruebas ejecutadas

| Prueba | Resultado |
| :--- | :--- |
| `python -m PyInstaller ... run_server.py` | Aprobada (`dist/pesebrera3l-backend.exe`) |
| Ejecución del backend congelado + health/dashboard | Aprobada |
| `npx electron-builder --win portable` | Aprobada (`release/Pesebrera3L-Desk-1.0.0-portable.exe`) |

## 4. Decisiones tomadas

- Se usa Git LFS para los binarios `.exe` (GitHub limita a 100 MB por archivo).
- El backend empaquetado usa `PESEBRERA3L_DATA`/`PESEBRERA3L_BACKUP` para persistencia de datos.

## 5. Evidencias

- Artefacto: `release/Pesebrera3L-Desk-1.0.0-portable.exe`
- Script de construcción: `scripts/build-backend-exe.ps1`
- Esta acta: `docs/fases/fase-8-acta.md`

---

**Proyecto Pesebrera3L-Desk completado. Ver Fase 8 Acta y README.**