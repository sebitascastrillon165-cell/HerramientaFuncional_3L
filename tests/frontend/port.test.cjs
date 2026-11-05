const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizePort, DEFAULT_PORT } = require("../../electron/lib/port.js");

test("normalizePort returns default for invalid input", () => {
  assert.equal(normalizePort(undefined), 8000);
  assert.equal(normalizePort(null), DEFAULT_PORT);
  assert.equal(normalizePort("no-numero"), DEFAULT_PORT);
  assert.equal(normalizePort(""), DEFAULT_PORT);
});

test("normalizePort returns default for out-of-range values", () => {
  assert.equal(normalizePort(0), DEFAULT_PORT);
  assert.equal(normalizePort(65536), DEFAULT_PORT);
  assert.equal(normalizePort(-1), DEFAULT_PORT);
});

test("normalizePort accepts valid ports", () => {
  assert.equal(normalizePort(8000), 8000);
  assert.equal(normalizePort(8080), 8080);
  assert.equal(normalizePort("9000"), 9000);
  assert.equal(normalizePort(1), 1);
  assert.equal(normalizePort(65535), 65535);
});