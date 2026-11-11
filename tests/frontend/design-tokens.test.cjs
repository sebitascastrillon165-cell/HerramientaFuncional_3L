const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const themesPath = path.join(
  __dirname,
  "..",
  "..",
  "electron",
  "renderer",
  "styles",
  "themes.css"
);
const themesCss = fs.readFileSync(themesPath, "utf8");

const REQUIRED_TOKENS = [
  "--bg",
  "--surface",
  "--surface-2",
  "--text",
  "--text-muted",
  "--primary",
  "--accent",
  "--success",
  "--warning",
  "--danger",
  "--border",
];

function themeBlocks() {
  const pattern = /\[data-theme="([a-z]+)"\](?:\[data-mode="([a-z]+)"\])?\s*\{([^}]*)\}/g;
  const blocks = [];
  let match = pattern.exec(themesCss);
  while (match) {
    blocks.push({
      theme: match[1],
      mode: match[2] || "light",
      body: match[3],
    });
    match = pattern.exec(themesCss);
  }
  return blocks;
}

test("existen los 5 temas en los 3 modos (15 combinaciones)", () => {
  const blocks = themeBlocks();
  const themes = ["pampa", "noche", "valle", "luna", "rio"];
  const modes = ["light", "dark", "contrast"];
  assert.equal(blocks.length, 15, "Se esperaban 15 bloques de tema/modo");
  themes.forEach((theme) => {
    modes.forEach((mode) => {
      assert.ok(
        blocks.some((block) => block.theme === theme && block.mode === mode),
        "Falta la combinacion " + theme + "/" + mode
      );
    });
  });
});

test("cada combinacion define los tokens de color requeridos", () => {
  themeBlocks().forEach((block) => {
    REQUIRED_TOKENS.forEach((token) => {
      assert.ok(
        block.body.includes(token + ":"),
        "Falta " + token + " en " + block.theme + "/" + block.mode
      );
    });
  });
});

test("el modo alto contraste usa negro sobre blanco", () => {
  const contrast = themeBlocks().filter((block) => block.mode === "contrast");
  assert.equal(contrast.length, 5);
  contrast.forEach((block) => {
    assert.match(block.body, /--bg:\s*#ffffff/);
    assert.match(block.body, /--text:\s*#000000/);
    assert.match(block.body, /--border:\s*#000000/);
  });
});

test("existen los 3 perfiles de daltonismo", () => {
  const profiles = [...themesCss.matchAll(/\[data-dichromacy="([a-z]+)"\]\s*\{/g)].map(
    (match) => match[1]
  );
  assert.deepEqual(profiles.sort(), ["deuteranopia", "protanopia", "tritanopia"]);
});

test("los tokens derivados del rediseno estan por modo", () => {
  assert.match(themesCss, /--shadow-tint:/);
  assert.match(themesCss, /--scheme:/);
  assert.match(themesCss, /\[data-mode="dark"\]\s*\{[^}]*--scheme:\s*dark/);
  const contrastStart = themesCss.lastIndexOf('[data-mode="contrast"] {');
  assert.ok(contrastStart > -1, "Falta el bloque de alto contraste");
  const contrastBlock = themesCss.slice(contrastStart, contrastStart + 400);
  assert.match(contrastBlock, /--brand-gradient:\s*linear-gradient\(0deg, #000000, #000000\)/);
});
