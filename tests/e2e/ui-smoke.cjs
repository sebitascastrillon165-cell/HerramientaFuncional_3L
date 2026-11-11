const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("node:assert/strict");
const { _electron: electron } = require("playwright-core");

const repoRoot = path.join(__dirname, "..", "..");
const qaDir = path.join(repoRoot, "docs", "qa");
const exeIndex = process.argv.indexOf("--exe");
const exePath = exeIndex > -1 ? path.resolve(process.argv[exeIndex + 1]) : null;

const consoleErrors = [];

async function waitForSwal(page, expectedIcon) {
  await page.waitForSelector(".swal2-container", { state: "visible", timeout: 15000 });
  const details = await page.evaluate(() => {
    const popup = document.querySelector(".swal2-popup");
    return {
      className: popup ? popup.className : "",
      title: document.querySelector(".swal2-title") ? document.querySelector(".swal2-title").textContent : "",
      text: document.querySelector(".swal2-html-container")
        ? document.querySelector(".swal2-html-container").textContent
        : "",
    };
  });
  if (expectedIcon && !details.className.includes("swal2-icon-" + expectedIcon)) {
    throw new Error(
      "SweetAlert inesperado: " + details.title + " | " + details.text + " | " + details.className
    );
  }
  await page.waitForSelector(".swal2-container", { state: "hidden", timeout: 15000 });
}

async function submitForm(page, formSelector) {
  await page.click(formSelector + " button[type=submit]");
  await waitForSwal(page, "success");
}

async function main() {
  fs.mkdirSync(qaDir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pesebrera3l-qa-"));
  const configPath = path.join(tmp, "config.json");
  fs.writeFileSync(configPath, JSON.stringify({ port: 8877 }));

  const stamp = String(Date.now()).slice(-6);
  const stallName = "QA Box " + stamp;
  const riderName = "QA Montador " + stamp;
  const animalName = "QA Relampago " + stamp;
  const tariffName = "QA Hospedaje " + stamp;

  const env = Object.assign({}, process.env, {
    PESEBRERA3L_CONFIG: configPath,
    PESEBRERA3L_DATA: path.join(tmp, "data"),
    PESEBRERA3L_BACKUP: path.join(tmp, "backups"),
  });

  const launchOptions = { args: exePath ? [] : [repoRoot], env };
  if (exePath) {
    launchOptions.executablePath = exePath;
  }

  console.log("Lanzando " + (exePath || "electron en modo desarrollo") + " ...");
  const app = await electron.launch(launchOptions);
  let page;
  try {
    page = await app.firstWindow();
    page.setDefaultTimeout(45000);
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => consoleErrors.push(String(error)));

    await page.waitForSelector("#apiStatus[data-state='ok']", { timeout: 120000 });
    assert.equal(await page.title(), "Pesebrera3L-Desk");
    assert.equal(await page.locator(".nav-item").count(), 6);

    const dashboardValues = await page.evaluate(() => ({
      stalls: document.getElementById("statStallsTotal").textContent,
      animals: document.getElementById("statAnimalsTotal").textContent,
    }));
    assert.match(dashboardValues.stalls, /^\d+$/);
    assert.match(dashboardValues.animals, /^\d+$/);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(qaDir, "01-dashboard-pampa-light.png") });

    for (const view of ["stables", "animals", "riders", "tariffs", "control", "dashboard"]) {
      await page.click('[data-view="' + view + '"]');
      const active = await page.locator("#view-" + view + ".active").count();
      assert.equal(active, 1, "La vista " + view + " no se activo");
    }

    await page.click('[data-view="stables"]');
    await page.fill("#stallName", stallName);
    await page.fill("#stallCapacity", "2");
    await submitForm(page, "#formStall");
    await page.waitForFunction(
      (name) => document.getElementById("stallsTbody").textContent.includes(name),
      stallName
    );

    await page.click('[data-view="riders"]');
    await page.fill("#riderName", riderName);
    await page.fill("#riderPhone", "300 111 2222");
    await submitForm(page, "#formRider");
    await page.waitForFunction(
      (name) => document.getElementById("ridersTbody").textContent.includes(name),
      riderName
    );

    await page.click('[data-view="animals"]');
    await page.waitForFunction(
      () => document.querySelectorAll("#animalStall option").length > 1
    );
    await page.waitForFunction(
      () => document.querySelectorAll("#animalRider option").length > 1
    );
    await page.selectOption("#animalType", "caballo");
    await page.fill("#animalName", animalName);
    await page.fill("#animalRaza", "Criollo");
    await page.selectOption("#animalSexo", "macho");
    const stallValue = await page.$eval(
      "#animalStall",
      (select, name) =>
        Array.from(select.options).find((option) => option.textContent.includes(name)).value,
      stallName
    );
    await page.selectOption("#animalStall", stallValue);
    const riderValue = await page.$eval(
      "#animalRider",
      (select, name) =>
        Array.from(select.options).find((option) => option.textContent.includes(name)).value,
      riderName
    );
    await page.selectOption("#animalRider", riderValue);
    await submitForm(page, "#formAnimal");
    await page.waitForFunction(
      (name) => document.getElementById("animalsTbody").textContent.includes(name),
      animalName
    );

    await page.click('[data-view="tariffs"]');
    await page.fill("#tariffName", tariffName);
    await page.fill("#tariffPrice", "150000");
    await submitForm(page, "#formTariff");
    await page.waitForFunction(() =>
      document.getElementById("tariffsTbody").textContent.includes("150000.00")
    );

    await page.click('[data-view="dashboard"]');
    await page.waitForFunction(
      () => {
        const total = Number(document.getElementById("statStallsTotal").textContent);
        const animals = Number(document.getElementById("statAnimalsTotal").textContent);
        return total >= 1 && animals >= 1;
      },
      null,
      { timeout: 15000 }
    );
    const occupancy = await page.locator("#animalsByStall .occ-bar").count();
    assert.ok(occupancy >= 1, "La lista de ocupacion no muestra barras");

    await page.selectOption("#themeSelect", "noche");
    await page.selectOption("#modeSelect", "dark");
    await page.selectOption("#dichromacySelect", "protanopia");
    const themeState = await page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      mode: document.documentElement.dataset.mode,
      dichromacy: document.documentElement.dataset.dichromacy,
    }));
    assert.deepEqual(themeState, {
      theme: "noche",
      mode: "dark",
      dichromacy: "protanopia",
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(qaDir, "02-dashboard-noche-dark.png") });

    await page.reload();
    await page.waitForSelector("#apiStatus[data-state='ok']", { timeout: 120000 });
    const restoredTheme = await page.evaluate(
      () => document.documentElement.dataset.theme
    );
    assert.equal(restoredTheme, "noche", "El tema no persistio tras recargar");
    const rowsAfterReload = await page.evaluate(
      () => document.getElementById("stallsTbody").textContent
    );
    assert.equal(typeof rowsAfterReload, "string");

    await page.click('[data-view="control"]');
    assert.equal(await page.inputValue("#apiPort"), "8877");
    await page.fill("#apiPort", "8878");
    await submitForm(page, "#formPort");
    await page.waitForFunction(
      () => document.getElementById("portStatus").textContent.includes("8878"),
      null,
      { timeout: 30000 }
    );
    await page.waitForFunction(
      async () => {
        try {
          const settings = await window.electronAPI.getSettings();
          return settings.port === 8878;
        } catch (error) {
          return false;
        }
      },
      null,
      { timeout: 30000 }
    );
    const health = await page.evaluate(() =>
      window.electronAPI.invokeApi({ method: "GET", path: "/api/v1/health" })
    );
    assert.equal(health.status, "ok", "El backend no responde en el puerto nuevo");
    await page.waitForSelector("#apiStatus[data-state='ok']", { timeout: 120000 });
    await page.click('[data-view="dashboard"]');
    await page.waitForFunction(
      () => document.getElementById("statStallsTotal").textContent !== "0",
      null,
      { timeout: 30000 }
    );

    await page.selectOption("#themeSelect", "pampa");
    await page.selectOption("#modeSelect", "light");
    await page.selectOption("#dichromacySelect", "none");
    await page.click('[data-view="stables"]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(qaDir, "03-pesebreras-pampa-light.png") });

    const fatalErrors = consoleErrors.filter((message) =>
      /Uncaught|TypeError|ReferenceError|SyntaxError/.test(message)
    );
    assert.deepEqual(fatalErrors, [], "Errores de consola fatales: " + fatalErrors.join(" | "));

    console.log("QA E2E aprobada.");
    console.log("Capturas en " + qaDir);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error("QA E2E fallo:", error);
  fs.mkdirSync(qaDir, { recursive: true });
  try {
    fs.writeFileSync(
      path.join(qaDir, "e2e-error.log"),
      String(error && error.stack ? error.stack : error) +
        "\n\nConsola:\n" +
        consoleErrors.join("\n")
    );
  } catch (ignored) {}
  process.exitCode = 1;
});
