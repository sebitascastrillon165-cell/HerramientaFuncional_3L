(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.ThemeEngine = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const SUPPORTED_THEMES = ["pampa", "noche", "valle", "luna", "rio"];
  const SUPPORTED_MODES = ["light", "dark", "contrast"];
  const SUPPORTED_DICHROMACY = ["none", "protanopia", "deuteranopia", "tritanopia"];
  const DEFAULT_STATE = Object.freeze({ theme: "pampa", mode: "light", dichromacy: "none" });

  function normalizeVisualState(input) {
    const raw = input || {};
    const theme = SUPPORTED_THEMES.includes(raw.theme) ? raw.theme : DEFAULT_STATE.theme;
    const mode = SUPPORTED_MODES.includes(raw.mode) ? raw.mode : DEFAULT_STATE.mode;
    const dichromacy = SUPPORTED_DICHROMACY.includes(raw.dichromacy)
      ? raw.dichromacy
      : DEFAULT_STATE.dichromacy;
    return { theme, mode, dichromacy };
  }

  function applyVisualState(documentLike, input) {
    const state = normalizeVisualState(input);
    const rootElement = documentLike && documentLike.documentElement ? documentLike.documentElement : null;
    if (rootElement) {
      rootElement.dataset.theme = state.theme;
      rootElement.dataset.mode = state.mode;
      rootElement.dataset.dichromacy = state.dichromacy;
    }
    return state;
  }

  return {
    SUPPORTED_THEMES,
    SUPPORTED_MODES,
    SUPPORTED_DICHROMACY,
    DEFAULT_STATE,
    normalizeVisualState,
    applyVisualState,
  };
});