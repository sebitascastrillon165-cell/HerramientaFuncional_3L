const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const rendererDir = path.join(__dirname, "..", "..", "electron", "renderer");
const html = fs.readFileSync(path.join(rendererDir, "index.html"), "utf8");
const appJs = fs.readFileSync(path.join(rendererDir, "js", "app.js"), "utf8");
const baseCss = fs.readFileSync(path.join(rendererDir, "styles", "base.css"), "utf8");

function referencedIds() {
  const ids = new Set();
  const pattern = /\$\("([A-Za-z0-9_]+)"\)/g;
  let match = pattern.exec(appJs);
  while (match) {
    ids.add(match[1]);
    match = pattern.exec(appJs);
  }
  return [...ids];
}

test("todo ID usado por app.js existe en index.html", () => {
  const ids = referencedIds();
  assert.ok(ids.length >= 30, "Se esperaban al menos 30 IDs referenciados");
  ids.forEach((id) => {
    assert.match(html, new RegExp('id="' + id + '"'), "Falta el ID " + id + " en index.html");
  });
});

test("la navegacion conserva las seis vistas del contrato", () => {
  const views = [...html.matchAll(/data-view="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(
    [...new Set(views)].sort(),
    ["animals", "control", "dashboard", "riders", "stables", "tariffs"]
  );
  ["dashboard", "stables", "animals", "riders", "tariffs", "control"].forEach((view) => {
    assert.match(html, new RegExp('id="view-' + view + '"'));
  });
});

test("las opciones de tema, modo y daltonismo se mantienen", () => {
  function optionsOf(selectId) {
    const pattern = new RegExp('<select id="' + selectId + '">([\\s\\S]*?)</select>');
    const match = html.match(pattern);
    assert.ok(match, "Falta el select " + selectId);
    return [...match[1].matchAll(/value="([a-z]+)"/g)].map((m) => m[1]);
  }
  assert.deepEqual(optionsOf("themeSelect"), ["pampa", "noche", "valle", "luna", "rio"]);
  assert.deepEqual(optionsOf("modeSelect"), ["light", "dark", "contrast"]);
  assert.deepEqual(optionsOf("dichromacySelect"), [
    "none",
    "protanopia",
    "deuteranopia",
    "tritanopia",
  ]);
});

test("todos los controles de formulario tienen etiqueta visible", () => {
  const controlIds = [
    "stallName",
    "stallCapacity",
    "stallQuantity",
    "animalType",
    "animalName",
    "animalRaza",
    "animalSexo",
    "animalStall",
    "animalRider",
    "animalRiderDisponible",
    "riderName",
    "riderPhone",
    "tariffName",
    "tariffPrice",
    "apiPort",
    "themeSelect",
    "modeSelect",
    "dichromacySelect",
  ];
  controlIds.forEach((id) => {
    assert.match(html, new RegExp('for="' + id + '"'), "Falta label for=" + id);
    assert.match(html, new RegExp('id="' + id + '"'), "Falta el control " + id);
  });
});

test("no hay recursos externos ni CDN en la interfaz", () => {
  assert.doesNotMatch(html, /(?:src|href)="https?:\/\//i);
  assert.match(html, /vendor\/fontawesome/);
  assert.match(html, /vendor\/sweetalert2/);
});

test("el CSS define foco visible, movimiento reducido y estados vacios", () => {
  assert.match(baseCss, /:focus-visible/);
  assert.match(baseCss, /prefers-reduced-motion/);
  assert.match(baseCss, /:has\(tbody:empty\)/);
  assert.match(baseCss, /--brand-gradient/);
  assert.match(baseCss, /grid-template-areas/);
});

test("el layout activo expone el indicador de estado de la API", () => {
  assert.match(html, /id="apiStatus"/);
  assert.match(html, /id="apiStatusText"/);
  assert.match(baseCss, /api-status\[data-state="ok"\]/);
  assert.match(baseCss, /api-status\[data-state="off"\]/);
});

test("la vista de pesebreras permite altas por cantidad", () => {
  assert.match(html, /id="stallQuantity"[^>]*min="1"[^>]*max="100"/);
  assert.match(html, /field-hint/);
});

test("el formulario de animales expone la disponibilidad del montador", () => {
  assert.match(html, /id="animalRiderDisponible"[^>]*disabled/);
  assert.match(html, /Disponible para mas caballos/);
  assert.match(html, /No disponible para mas caballos/);
});

test("las tablas incluyen acciones de eliminacion con confirmacion", () => {
  const headers = html.match(/<th>Acciones<\/th>/g) || [];
  assert.ok(headers.length >= 3, "Faltan columnas Acciones en las tablas");
  assert.match(appJs, /data-action="delete-stall"/);
  assert.match(appJs, /data-action="delete-animal"/);
  assert.match(appJs, /data-action="delete-rider"/);
  assert.match(appJs, /Swal\.fire/);
  assert.match(appJs, /confirmDelete/);
});

test("la tabla de animales muestra nombres de pesebrera y montador", () => {
  assert.match(appJs, /pesebrera_nombre/);
  assert.match(appJs, /montador_nombre/);
});
