const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const html = fs.readFileSync(path.join(__dirname, "..", "..", "electron", "renderer", "index.html"), "utf8");

test("index.html uses semantic HTML5 layout", () => {
  assert.match(html, /<header\b/);
  assert.match(html, /<aside class="sidebar"/);
  assert.match(html, /<main class="content"/);
  assert.match(html, /<footer\b/);
});

test("index.html integrates Font Awesome and SweetAlert", () => {
  assert.match(html, /font-awesome/);
  assert.match(html, /sweetalert2/);
});

test("index.html exposes the required views", () => {
  assert.match(html, /view-dashboard/);
  assert.match(html, /view-stables/);
  assert.match(html, /view-animals/);
  assert.match(html, /view-riders/);
  assert.match(html, /view-tariffs/);
});