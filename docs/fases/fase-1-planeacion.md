# Fase 1 â€” PlaneaciÃ³n: AnÃ¡lisis y Requisitos

**Proyecto:** Pesebrera3L-Desk
**Documento fuente:** `IEEE-830-(3L).md` (ERS v1.0.0)
**EstÃ¡ndar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-05

---

## 1. Objetivos de la fase

1. Leer, validar y comprender el documento completo de EspecificaciÃ³n de Requisitos de Software (ERS).
2. Extraer los requisitos funcionales (RF) y no funcionales (RNF) con sus prioridades.
3. Identificar los mÃ³dulos de la soluciÃ³n y las clases de usuario.
4. Preparar la base para la trazabilidad IEEE 830 â†’ diseÃ±o â†’ implementaciÃ³n â†’ pruebas.

## 2. Requisitos IEEE 830 considerados

| ID | DescripciÃ³n | MÃ³dulo | Prioridad |
| :--- | :--- | :--- | :--- |
| RF-01 | Registrar, mostrar y actualizar pesebreras; distinguir disponibles y llenas. | GestiÃ³n de pesebreras | Alta |
| RF-02 | Registrar exclusivamente equinos (caballos) y mulares (mulas); asociarlos a una pesebrera y a un montador. | Control de equinos y mulares | Alta |
| RF-03 | Administrar montadores: total, disponibles y carga exacta de animales. | GestiÃ³n de montadores | Alta |
| RF-04 | Definir, modificar y calcular precios de alquiler, servicios y mantenimiento por animal. | Financiero y tarifario | Media |
| RF-05 | Estructura de vistas con HTML5 semÃ¡ntico (`header`, `sidebar`, `content`, `footer`). | Interfaz de usuario | Alta |
| RF-06 | Font Awesome + SweetAlert para iconos y alertas. | Interfaz de usuario | Alta |
| RF-07 | 5 temas; cada uno con modo claro, oscuro y alto contraste. | PersonalizaciÃ³n visual | Alta |
| RF-08 | Perfiles de daltonismo: Protanopia, Deuteranopia y Tritanopia. | Accesibilidad visual | Alta |
| RF-09 | Backend Python con API REST local (FastAPI o Flask). | NÃºcleo de APIs externas | Media |
| RNF-01 | Renderizado de mÃ³dulos/temas â‰¤ 200 ms. | Rendimiento | Alta |
| RNF-02 | Operaciones locales de lectura/escritura del servidor Python â‰¤ 300 ms. | Rendimiento | Alta |
| RNF-03 | SQLite con integridad referencial; respaldo automÃ¡tico al cierre. | Confiabilidad | Alta |
| RNF-04 | WCAG 2.1; empaquetado Windows 10/11 x64. | Accesibilidad / Portabilidad | Media |

## 3. Entregables de la fase

- Documento fuente `IEEE-830-(3L).md` (sin modificaciones, fuente de verdad).
- Esta planeaciÃ³n (`docs/fases/fase-1-planeacion.md`).

## 4. Criterios de aceptaciÃ³n

- El ERS completo ha sido leÃ­do y comprendido.
- Cada requisito funcional y no funcional tiene identificador, descripciÃ³n y prioridad trazables.

## 5. Riesgos

| Riesgo | Probabilidad | Impacto | MitigaciÃ³n |
| :--- | :--- | :--- | :--- |
| AmbigÃ¼edad en volumen de datos inicial | Media | Medio | Definir esquema inicial mÃ­nimo viable |
| Alcance de temas/daltonismo mal especificado | Media | Alto | Validar paletas con contraste WCAG 2.1 |

---

**Fase 1 en curso. Acta de cierre al finalizar el anÃ¡lisis.**

