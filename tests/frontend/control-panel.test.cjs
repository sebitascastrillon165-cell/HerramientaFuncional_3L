const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const html = fs.readFileSync(path.join(__dirname, "..", "..", "electron", "renderer", "index.html"), "utf8");

test("index.html exposes the control panel view", () => {
  assert.match(html, /view-control/);
  assert.match(html, /id="formPort"/);
  assert.match(html, /id="apiPort"/);
  assert.match(html, /id="portStatus"/);
});

test("index.html registers the sidebar entry for panel de control", () => {
  assert.match(html, /data-view="control"/);
  assert.match(html, /Panel de control/);
});