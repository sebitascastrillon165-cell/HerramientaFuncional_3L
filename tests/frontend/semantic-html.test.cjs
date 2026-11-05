const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const rendererDir = path.join(__dirname, "..", "..", "electron", "renderer");
const html = fs.readFileSync(path.join(rendererDir, "index.html"), "utf8");

test("index.html uses semantic HTML5 layout", () => {
  assert.match(html, /<header\b/);
  assert.match(html, /<aside class="sidebar"/);
  assert.match(html, /<main class="content"/);
  assert.match(html, /<footer\b/);
});

test("index.html integrates local Font Awesome and SweetAlert", () => {
  assert.match(html, /vendor\/fontawesome/);
  assert.match(html, /vendor\/sweetalert2/);
  assert.doesNotMatch(html, /font-awesome\/6\./);
  assert.doesNotMatch(html, /sweetalert2@/);
});

test("vendor assets exist on disk", () => {
  const assets = [
    path.join(rendererDir, "vendor", "fontawesome", "css", "all.min.css"),
    path.join(rendererDir, "vendor", "fontawesome", "webfonts", "fa-solid-900.woff2"),
    path.join(rendererDir, "vendor", "sweetalert2", "sweetalert2.min.css"),
    path.join(rendererDir, "vendor", "sweetalert2", "sweetalert2.min.js"),
  ];
  assets.forEach((asset) => assert.ok(fs.existsSync(asset), "No se encontro el recurso " + asset));
});

test("index.html exposes the required views", () => {
  assert.match(html, /view-dashboard/);
  assert.match(html, /view-stables/);
  assert.match(html, /view-animals/);
  assert.match(html, /view-riders/);
  assert.match(html, /view-tariffs/);
  assert.match(html, /view-control/);
});