const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../../electron/renderer/js/theme-engine.js");

test("normalizeVisualState returns defaults on invalid input", () => {
  const state = engine.normalizeVisualState({ theme: "nope", mode: "nope", dichromacy: "nope" });
  assert.deepEqual(state, { theme: "pampa", mode: "light", dichromacy: "none" });
});

test("normalizeVisualState keeps valid values", () => {
  const state = engine.normalizeVisualState({ theme: "noche", mode: "dark", dichromacy: "tritanopia" });
  assert.equal(state.theme, "noche");
  assert.equal(state.mode, "dark");
  assert.equal(state.dichromacy, "tritanopia");
});

test("normalizeVisualState tolerates empty input", () => {
  assert.deepEqual(engine.normalizeVisualState(null), { theme: "pampa", mode: "light", dichromacy: "none" });
});

test("applyVisualState writes data attributes on root element", () => {
  const root = { dataset: {} };
  const state = engine.applyVisualState({ documentElement: root }, { theme: "rio", mode: "contrast", dichromacy: "deuteranopia" });
  assert.equal(root.dataset.theme, "rio");
  assert.equal(root.dataset.mode, "contrast");
  assert.equal(root.dataset.dichromacy, "deuteranopia");
  assert.equal(state.theme, "rio");
});

test("supported catalogs match ERS", () => {
  assert.deepEqual(engine.SUPPORTED_THEMES, ["pampa", "noche", "valle", "luna", "rio"]);
  assert.deepEqual(engine.SUPPORTED_MODES, ["light", "dark", "contrast"]);
  assert.deepEqual(engine.SUPPORTED_DICHROMACY, ["none", "protanopia", "deuteranopia", "tritanopia"]);
});