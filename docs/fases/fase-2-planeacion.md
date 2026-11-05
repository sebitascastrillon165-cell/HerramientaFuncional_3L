# Fase 2 — Planeación: Diseño de Arquitectura

**Proyecto:** Pesebrera3L-Desk
**Documento fuente:** `IEEE-830-(3L).md` (ERS v1.0.0)
**Estándar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-05

---

## 1. Objetivos de la fase

1. Definir la arquitectura de tres capas propuesta para Pesebrera3L-Desk.
2. Definir el flujo de comunicación entre Electron (renderer/main) y el núcleo Python.
3. Definir los límites de responsabilidad de cada módulo.

## 2. Requisitos IEEE 830 considerados

| ID | Descripción | Módulo | Prioridad |
| :--- | :--- | :--- | :--- |
| RF-05 | HTML5 semántico (`header`, `sidebar`, `content`, `footer`). | Arquitectura frontend | Alta |
| RF-09 | API REST local en Python. | Arquitectura backend | Media |
| RNF-01 | Renderizado ≤ 200 ms. | Rendimiento | Alta |
| RNF-03 | Respaldo automático. | Arquitectura backend | Alta |

## 3. Entregables de la fase

- `docs/fases/fase-2-planeacion.md`
- `docs/fases/fase-2-acta.md`
- Diseño de arquitectura aprobado.

## 4. Criterios de aceptación

- Se define el diagrama de componentes y las responsabilidades por capa.

## 5. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| Acoplamiento IPC/backend | Media | Alto | Abstracción del puente IPC genérico |

---

**Estado:** Fase 2 cerrada. Ver `docs/fases/fase-2-acta.md`.