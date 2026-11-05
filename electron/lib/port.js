"use strict";

const DEFAULT_PORT = 8000;

function normalizePort(value, fallback) {
  const fb = Number.isInteger(fallback) ? fallback : DEFAULT_PORT;
  const port = Number(value);
  if (Number.isInteger(port) && port >= 1 && port <= 65535) {
    return port;
  }
  return fb;
}

module.exports = { DEFAULT_PORT, normalizePort };