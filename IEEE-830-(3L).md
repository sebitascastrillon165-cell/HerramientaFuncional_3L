# Especificación de Requisitos de Software (ERS)
## Sistema de Gestión Integral para Pesebrera 3L (`Pesebrera3L-Desk`)

**Versión:** 1.0.0  
**Estándar de Referencia:** IEEE Std 830-1998  
**Plataforma Objetivo:** Escritorio Windows (Compilado nativo mediante Electron y Python Core)  
**Fecha:** 9 de noviembre de 2026  

---

## 1. Introducción

### 1.1 Propósito
El propósito de este documento es establecer de manera formal y detallada los requisitos funcionales y no funcionales para el desarrollo de la aplicación de escritorio **Pesebrera3L-Desk**. Esta herramienta optimizará el control operativo, administrativo y financiero de la pesebrera **3L**, enfocada exclusivamente en el manejo de equinos y mulares.

### 1.2 Ámbito del Sistema
El software permitirá automatizar y centralizar la administración interna de la pesebrera, abarcando:
* Control en tiempo real del estado de ocupación de las pesebreras (Totales, Disponibles, Ocupadas/Llenas).
* Gestión de la plantilla de montadores (Total de montadores, Disponibles, Carga de trabajo y asignación de equinos y mulares).
* Estructuración de tarifas y precios por servicios de hospedaje y cuidado.
* Módulo de accesibilidad visual avanzado (Temas múltiples, modos claro/oscuro/alto contraste y paletas específicas para daltonismo).
* Núcleo de procesamiento en **Python** interconectado con un contenedor frontend basado en **Electron** para Windows, provisto de pasarelas API para comunicación externa.

### 1.3 Definiciones, Acrónimos y Abreviaturas
* **ERS:** Especificación de Requisitos de Software (IEEE Std 830).
* **Electron:** Framework de desarrollo de aplicaciones de escritorio multiplataforma utilizando HTML, CSS y JavaScript.
* **Python Core:** Módulo backend encargado de la lógica de negocio, persistencia de datos y APIs de comunicación externa.
* **Protanopia / Deuteranopia / Tritanopia:** Trastornos de la visión cromática (daltonismo) que requieren paletas de colores adaptadas.
* **Font Awesome:** Biblioteca de iconos vectoriales para interfaces de usuario.
* **SweetAlert:** Librería JavaScript para alertas modales interactivas y personalizadas.

### 1.4 Referencias
* [1] IEEE Std 830-1998: *IEEE Recommended Practice for Software Requirements Specifications*.
* [2] Documentación oficial de Electron (ElectronJS Framework API Reference).
* [3] Guía de diseño de accesibilidad web (WCAG 2.1 - Web Content Accessibility Guidelines).

### 1.5 Resumen del Documento
Este documento contiene tres secciones principales: la Introducción, la Descripción General del sistema (perspectiva, funciones, clases de usuario y entorno operativo) y los Requisitos Específicos (funcionales, no funcionales e interfaces de usuario y software).

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
**Pesebrera3L-Desk** es una solución de escritorio autónoma e interactiva compilada para sistemas operativos **Windows**. Su arquitectura se divide en dos capas principales:
1. **Capa Frontend (Electron + HTML5 Semántico + CSS3):** Interfaz gráfica de usuario organizada estructuralmente mediante etiquetas semánticas (`header`, `sidebar`, `content`, `footer`), integrada con **Font Awesome** para iconografía y **SweetAlert** para notificaciones y confirmaciones dinámicas.
2. **Capa Backend / Núcleo (Python):** Motor lógico que administra la base de datos local (SQLite), procesa consultas de inventario, ocupación y tarifas, y expone **APIs REST** internas/externas para la sincronización con sistemas de terceros o pasarelas de pago.

### 2.2 Funciones del Producto
El sistema cumplirá con los siguientes bloques de operaciones principales:
* **Panel de Control (Dashboard):** Visualización inmediata de métricas clave (Total de pesebreras, disponibles, llenas, montadores activos, montadores disponibles y distribución de animales).
* **Gestión de Equinos y Mulares:** Registro y vinculación exclusiva de caballos y mulares con su respectivo montador asignado.
* **Control de Personal (Montadores):** Seguimiento de disponibilidad horaria y carga de animales asignados por operario.
* **Módulo Financiero y Tarifario:** Configuración y cálculo de precios por pesebrera, tenencia, alimentación y servicios de pesebrera.
* **Motor de Accesibilidad Visual:** Selector dinámico con 5 temas base, cada uno con opciones de modo claro, oscuro, alto contraste y modos especiales para daltonismo (**Protanopia**, **Deuteranopia**, **Tritanopia**).

### 2.3 Clases y Características de Usuarios
* **Administrador:** Acceso total a la configuración del sistema, gestión de tarifas, altas/bajas de pesebreras, asignación de montadores y reportes externos vía API.
* **Montador / Personal Operativo:** Acceso de consulta para verificar sus animales asignados, estado de pesebreras y registro de novedades diarias.

### 2.4 Entorno de Operación
* **Sistema Operativo:** Microsoft Windows 10 y Windows 11 (Arquitectura x64).
* **Entorno de Ejecución:** Paquete ejecutable compilado (`.exe` con Electron Builder / PyInstaller para el núcleo Python incrustado).

### 2.5 Restricciones de Diseño e Implementación
* El software debe admitir **únicamente** la gestión de equinos y mulares.
* La interfaz gráfica debe mantener una estética clásica e interactiva adaptada a la temática de la pesebrera.
* El frontend debe estructurarse mediante código HTML semántico (`<header>`, `<aside>`, `<main>`, `<footer>`).

### 2.6 Suposiciones y Dependencias
* Se asume que el equipo cliente Windows cumple con los requisitos mínimos de hardware para ejecutar aplicaciones basadas en Electron.
* La comunicación API externa depende de la conectividad de red local o a Internet según los módulos a integrar.

---

## 3. Requisitos Específicos

### 3.1 Requisitos Funcionales (RF)

| ID | Módulo | Descripción Detallada | Prioridad |
| :--- | :--- | :--- | :--- |
| **RF-01** | **Gestión de Pesebreras** | El sistema debe registrar, mostrar y actualizar el total de pesebreras de la Pesebrera 3L, diferenciando visualmente entre *pesebreras disponibles* y *pesebreras llenas*. | Alta |
| **RF-02** | **Control de Equinos y Mulares** | La herramienta debe permitir registrar exclusivamente equinos (caballos) y mulares (mulas), asociándolos a una pesebrera específica y a un montador responsable. | Alta |
| **RF-03** | **Gestión de Montadores** | El sistema debe administrar el personal de montadores, mostrando el número total, montadores disponibles y la cantidad exacta de equinos y mulares bajo la responsabilidad de cada uno. | Alta |
| **RF-04** | **Control Financiero y Precios** | Permite definir, modificar y calcular los precios asociados al alquiler de pesebreras, servicios de pesebrera y mantenimiento por animal. | Media |
| **RF-05** | **Interfaz Semántica** | La estructura de las vistas de la aplicación debe construirse estrictamente bajo directrices semánticas HTML5 (`<header>`, `<aside class="sidebar">`, `<main class="content">`, `<footer>`). | Alta |
| **RF-06** | **Iconografía y Notificaciones** | Integración completa de **Font Awesome** para iconos vectoriales en botones y menús, y **SweetAlert** para la gestión de alertas, advertencias y confirmaciones de acciones del usuario. | Alta |
| **RF-07** | **Personalización de Temas** | El sistema ofrecerá **5 temas de colores principales**. Cada tema debe admitir conmutación en tiempo real entre **Modo Claro**, **Modo Oscuro** y **Modo Alto Contraste**. | Alta |
| **RF-08** | **Accesibilidad para Daltonismo** | Se deben incluir perfiles visuales específicos validados para usuarios con daltonismo: **Protanopia** (ceguera al rojo), **Deuteranopia** (ceguera al verde) y **Tritanopia** (ceguera al azul). | Alta |
| **RF-09** | **Núcleo de APIs Externas** | El backend en Python debe implementar un servidor API REST local (ej. FastAPI o Flask) para permitir la comunicación externa y la interoperabilidad con sistemas o dispositivos móviles. | Media |

### 3.2 Requisitos de Interfaces Externas

#### 3.2.1 Interfaz de Usuario (UI)
* **Distribución:** Layout estricto con componentes HTML5 semánticos (`header`, `sidebar`, `content`, `footer`).
* **Librerías Visuales:** Integración de Font Awesome para íconos interactivos y SweetAlert para la interacción dinámica mediante alertas modales.
* **Temas y Accesibilidad:** Implementación de 5 paletas de color clásicas, cada una configurable en variante Clara, Oscura y Alto Contraste, sumado a los 3 modos de corrección cromática para daltonismo (Protanopia, Deuteranopia, Tritanopia).

#### 3.2.2 Interfaces de Software / APIs
* Servidor local incrustado en Python encargado de exponer la API REST en el puerto local asignado.
* Puente de comunicación IPC (Inter-Process Communication) entre el proceso Renderer de Electron y el núcleo de Python.

### 3.3 Requisitos No Funcionales (RNF)

#### 3.3.1 Rendimiento
* El tiempo de renderizado de la interfaz al cambiar de módulos o temas de color no debe superar los 200 milisegundos.
* Las peticiones al servidor interno de Python deben resolverse en menos de 300 ms en operaciones locales de lectura/escritura.

#### 3.3.2 Confiabilidad y Seguridad
* La base de datos local SQLite mantendrá integridad referencial asegurando que no existan animales asignados a pesebreras inexistentes.
* Respaldo local de datos automático al cerrar la aplicación.

#### 3.3.3 Mantenibilidad y Portabilidad
* Empaquetado nativo para sistemas operativos Windows mediante `.exe` portable o ejecutable con instalador.
* Código fuente modularizado separando estilos (CSS/Temas), componentes visuales (JS/Electron) y la lógica de backend (Python API).