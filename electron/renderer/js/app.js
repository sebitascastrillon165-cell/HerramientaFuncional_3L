(function () {
  "use strict";

  const API_HOST = "http://127.0.0.1";
  let apiPort = 8000;

  function $(id) {
    return document.getElementById(id);
  }

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setApiStatus(state, text) {
    const chip = $("apiStatus");
    const label = $("apiStatusText");
    if (chip) {
      chip.dataset.state = state;
    }
    if (label) {
      label.textContent = text;
    }
  }

  function animateNumber(element, target) {
    if (!element) {
      return;
    }
    const to = Number(target) || 0;
    const from = Number(element.textContent) || 0;
    if (prefersReducedMotion || from === to) {
      element.textContent = String(to);
      return;
    }
    const duration = 600;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  async function rawApiRequest(method, path, body) {
    if (window.electronAPI && window.electronAPI.invokeApi) {
      return await window.electronAPI.invokeApi({ method, path, body });
    }
    const response = await fetch(API_HOST + ":" + apiPort + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || response.statusText);
    }
    if (response.status === 204) {
      return null;
    }
    return await response.json();
  }

  async function apiRequest(method, path, body) {
    try {
      const result = await rawApiRequest(method, path, body);
      setApiStatus("ok", "API local activa · :" + apiPort);
      return result;
    } catch (error) {
      const message = String(error && error.message ? error.message : error);
      if (/fetch failed|failed to fetch|ECONNREFUSED|network|backend/i.test(message)) {
        setApiStatus("off", "Sin conexion con la API local");
      }
      throw error;
    }
  }

  function showError(error) {
    const message = String(error && error.message ? error.message : error);
    if (typeof Swal !== "undefined") {
      Swal.fire({ icon: "error", title: "Error", text: message, confirmButtonText: "Entendido" });
    } else {
      console.error(message);
    }
  }

  function showSuccess(message) {
    if (typeof Swal !== "undefined") {
      Swal.fire({ icon: "success", title: "Listo", text: message, timer: 1500, showConfirmButton: false });
    }
  }

  function showInfo(message) {
    if (typeof Swal !== "undefined") {
      Swal.fire({ icon: "info", title: "Aviso", text: message });
    } else {
      console.log(message);
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function switchView(viewId) {
    document.querySelectorAll(".view").forEach(function (el) {
      el.classList.toggle("active", el.id === "view-" + viewId);
    });
    document.querySelectorAll(".nav-item").forEach(function (el) {
      const isActive = el.dataset.view === viewId;
      el.classList.toggle("active", isActive);
      if (isActive) {
        el.setAttribute("aria-current", "page");
      } else {
        el.removeAttribute("aria-current");
      }
    });
    if (viewId === "dashboard") {
      loadDashboard();
    } else if (viewId === "stables") {
      loadStalls();
    } else if (viewId === "animals") {
      loadAnimals();
    } else if (viewId === "riders") {
      loadRiders();
    } else if (viewId === "tariffs") {
      loadTariffs();
    } else if (viewId === "control") {
      syncPortControls();
    }
  }

  function buildOccupancyItem(item) {
    const li = document.createElement("li");
    const row = document.createElement("div");
    row.className = "occ-row";
    const name = document.createElement("span");
    name.className = "occ-name";
    name.textContent = item.nombre;
    const meta = document.createElement("span");
    meta.className = "occ-meta";
    meta.textContent = item.animales + "/" + item.capacidad + " animales";
    row.appendChild(name);
    row.appendChild(meta);
    const bar = document.createElement("div");
    bar.className = "occ-bar";
    const fill = document.createElement("span");
    const ratio = item.capacidad > 0 ? Math.min(item.animales / item.capacidad, 1) : 0;
    fill.style.width = Math.round(ratio * 100) + "%";
    bar.appendChild(fill);
    li.appendChild(row);
    li.appendChild(bar);
    return li;
  }

  function loadDashboard() {
    return apiRequest("GET", "/api/v1/dashboard/")
      .then(function (data) {
        animateNumber($("statStallsTotal"), data.total_pesebreras);
        animateNumber($("statStallsAvailable"), data.disponibles_pesebreras);
        animateNumber($("statStallsFull"), data.llenas_pesebreras);
        animateNumber($("statRidersActive"), data.montadores_activos);
        animateNumber($("statRidersAvailable"), data.montadores_disponibles);
        animateNumber($("statAnimalsTotal"), data.total_animales);
        const list = $("animalsByStall");
        list.innerHTML = "";
        const items = data.animales_por_pesebrera || [];
        if (items.length === 0) {
          const empty = document.createElement("li");
          empty.className = "empty-note";
          empty.textContent = "Aun no hay pesebreras registradas.";
          list.appendChild(empty);
          return;
        }
        items.forEach(function (item) {
          list.appendChild(buildOccupancyItem(item));
        });
      })
      .catch(showError);
  }

  async function updateAnimalStallOptions(stalls) {
    const select = $("animalStall");
    select.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "Sin pesebrera";
    select.appendChild(none);
    stalls.forEach(function (stall) {
      const option = document.createElement("option");
      option.value = String(stall.id);
      option.textContent = stall.nombre + " (" + stall.estado + ")";
      select.appendChild(option);
    });
  }

  function syncRiderAvailability() {
    const riderSelect = $("animalRider");
    const availability = $("animalRiderDisponible");
    if (!riderSelect || !availability) {
      return;
    }
    const hasRider = riderSelect.value !== "";
    availability.disabled = !hasRider;
    if (!hasRider) {
      availability.value = "1";
      return;
    }
    const selected = riderSelect.options[riderSelect.selectedIndex];
    availability.value = selected && selected.dataset.disponible === "0" ? "0" : "1";
  }

  async function updateAnimalRiderOptions(riders) {
    const select = $("animalRider");
    select.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "Sin montador";
    select.appendChild(none);
    riders.forEach(function (rider) {
      const option = document.createElement("option");
      option.value = String(rider.id);
      option.textContent = rider.nombre + " (carga: " + rider.carga_total + ")";
      option.dataset.disponible = rider.disponible ? "1" : "0";
      select.appendChild(option);
    });
    syncRiderAvailability();
  }

  async function loadStalls() {
    try {
      const stalls = await apiRequest("GET", "/api/v1/pesebreras/");
      const tbody = $("stallsTbody");
      tbody.innerHTML = "";
      stalls.forEach(function (stall) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + stall.id + "</td>" +
          "<td>" + escapeHtml(stall.nombre) + "</td>" +
          "<td>" + stall.capacidad + "</td>" +
          "<td>" + (stall.estado === "disponible" ? "Disponible" : "Llena") + "</td>" +
          '<td><div class="table-actions"><button type="button" class="icon-btn" ' +
          'data-action="delete-stall" data-id="' + stall.id + '" ' +
          'title="Eliminar pesebrera" aria-label="Eliminar pesebrera ' +
          escapeHtml(stall.nombre) + '"><i class="fas fa-trash" aria-hidden="true"></i></button></div></td>';
        tbody.appendChild(tr);
      });
      await updateAnimalStallOptions(stalls);
    } catch (error) {
      showError(error);
    }
  }

  async function loadRiders() {
    try {
      const riders = await apiRequest("GET", "/api/v1/montadores/");
      const tbody = $("ridersTbody");
      tbody.innerHTML = "";
      riders.forEach(function (rider) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + rider.id + "</td>" +
          "<td>" + escapeHtml(rider.nombre) + "</td>" +
          "<td>" + escapeHtml(rider.telefono || "-") + "</td>" +
          "<td>" + rider.caballos + " / " + rider.mulas + "</td>" +
          "<td>" + (rider.disponible ? "Si" : "No") + "</td>" +
          '<td><div class="table-actions"><button type="button" class="icon-btn" ' +
          'data-action="delete-rider" data-id="' + rider.id + '" ' +
          'title="Eliminar montador" aria-label="Eliminar montador ' +
          escapeHtml(rider.nombre) + '"><i class="fas fa-trash" aria-hidden="true"></i></button></div></td>';
        tbody.appendChild(tr);
      });
      await updateAnimalRiderOptions(riders);
    } catch (error) {
      showError(error);
    }
  }

  async function loadAnimals() {
    try {
      const animals = await apiRequest("GET", "/api/v1/animales/");
      const tbody = $("animalsTbody");
      tbody.innerHTML = "";
      animals.forEach(function (animal) {
        const tr = document.createElement("tr");
        const stallLabel =
          animal.pesebrera_nombre ||
          (animal.pesebrera_id != null ? "#" + animal.pesebrera_id : "-");
        const riderLabel =
          animal.montador_nombre ||
          (animal.montador_id != null ? "#" + animal.montador_id : "-");
        tr.innerHTML =
          "<td>" + animal.id + "</td>" +
          "<td>" + escapeHtml(animal.tipo) + "</td>" +
          "<td>" + escapeHtml(animal.nombre) + "</td>" +
          "<td>" + escapeHtml(animal.raza || "-") + "</td>" +
          "<td>" + escapeHtml(stallLabel) + "</td>" +
          "<td>" + escapeHtml(riderLabel) + "</td>" +
          "<td>" + escapeHtml(animal.estado) + "</td>" +
          '<td><div class="table-actions"><button type="button" class="icon-btn" ' +
          'data-action="delete-animal" data-id="' + animal.id + '" ' +
          'title="Eliminar animal" aria-label="Eliminar animal ' +
          escapeHtml(animal.nombre) + '"><i class="fas fa-trash" aria-hidden="true"></i></button></div></td>';
        tbody.appendChild(tr);
      });
      const stalls = await apiRequest("GET", "/api/v1/pesebreras/");
      await updateAnimalStallOptions(stalls);
      const riders = await apiRequest("GET", "/api/v1/montadores/");
      await updateAnimalRiderOptions(riders);
    } catch (error) {
      showError(error);
    }
  }

  async function loadTariffs() {
    try {
      const tariffs = await apiRequest("GET", "/api/v1/tarifas/");
      const tbody = $("tariffsTbody");
      tbody.innerHTML = "";
      tariffs.forEach(function (tariff) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + tariff.id + "</td>" +
          "<td>" + escapeHtml(tariff.nombre) + "</td>" +
          "<td>$" + Number(tariff.precio).toFixed(2) + "</td>";
        tbody.appendChild(tr);
      });
    } catch (error) {
      showError(error);
    }
  }

  function confirmDelete(title, message, onConfirm) {
    if (typeof Swal === "undefined") {
      if (window.confirm(title + "\n\n" + message)) {
        onConfirm();
      }
      return;
    }
    Swal.fire({
      icon: "warning",
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b3261e",
      reverseButtons: true,
    }).then(function (result) {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  }

  function deleteRowRequest(path, successMessage, reload) {
    apiRequest("DELETE", path)
      .then(reload)
      .then(function () {
        showSuccess(successMessage);
      })
      .catch(showError);
  }

  function handleDeleteClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }
    const id = button.dataset.id;
    if (button.dataset.action === "delete-stall") {
      confirmDelete(
        "Eliminar pesebrera",
        "Los animales asignados quedaran sin pesebrera y en estado disponible.",
        function () {
          deleteRowRequest("/api/v1/pesebreras/" + id, "Pesebrera eliminada.", loadStalls);
        }
      );
    } else if (button.dataset.action === "delete-animal") {
      confirmDelete("Eliminar animal", "El registro del animal se eliminara del sistema.", function () {
        deleteRowRequest("/api/v1/animales/" + id, "Animal eliminado.", loadAnimals);
      });
    } else if (button.dataset.action === "delete-rider") {
      confirmDelete(
        "Eliminar montador",
        "Los animales asignados quedaran sin montador.",
        function () {
          deleteRowRequest("/api/v1/montadores/" + id, "Montador eliminado.", loadRiders);
        }
      );
    }
  }

  ["stallsTbody", "animalsTbody", "ridersTbody"].forEach(function (tbodyId) {
    const tbody = $(tbodyId);
    if (tbody) {
      tbody.addEventListener("click", handleDeleteClick);
    }
  });

  const animalRiderSelect = $("animalRider");
  if (animalRiderSelect) {
    animalRiderSelect.addEventListener("change", syncRiderAvailability);
  }

  $("formStall").addEventListener("submit", async function (event) {
    event.preventDefault();
    const cantidad = Number($("stallQuantity").value) || 1;
    try {
      const result = await apiRequest("POST", "/api/v1/pesebreras/", {
        nombre: $("stallName").value.trim(),
        capacidad: Number($("stallCapacity").value),
        cantidad: cantidad,
      });
      $("formStall").reset();
      const created = result && Array.isArray(result.creadas) ? result.creadas.length : 1;
      await loadStalls();
      showSuccess(
        created === 1 ? "Pesebrera registrada." : created + " pesebreras registradas."
      );
    } catch (error) {
      showError(error);
    }
  });

  $("formAnimal").addEventListener("submit", async function (event) {
    event.preventDefault();
    const stallId = $("animalStall").value ? Number($("animalStall").value) : null;
    const riderId = $("animalRider").value ? Number($("animalRider").value) : null;
    try {
      await apiRequest("POST", "/api/v1/animales/", {
        tipo: $("animalType").value,
        nombre: $("animalName").value.trim(),
        raza: $("animalRaza").value.trim() || null,
        sexo: $("animalSexo").value,
        pesebrera_id: stallId,
        montador_id: riderId,
        montador_disponible:
          riderId != null ? $("animalRiderDisponible").value === "1" : null,
        estado: stallId != null ? "asignado" : "disponible",
      });
      $("formAnimal").reset();
      await loadAnimals();
      showSuccess("Animal registrado.");
    } catch (error) {
      showError(error);
    }
  });

  $("formRider").addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
      await apiRequest("POST", "/api/v1/montadores/", {
        nombre: $("riderName").value.trim(),
        telefono: $("riderPhone").value.trim() || null,
        disponible: true,
      });
      $("formRider").reset();
      await loadRiders();
      showSuccess("Montador registrado.");
    } catch (error) {
      showError(error);
    }
  });

  $("formTariff").addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
      await apiRequest("POST", "/api/v1/tarifas/", {
        nombre: $("tariffName").value.trim(),
        precio: Number($("tariffPrice").value),
      });
      $("formTariff").reset();
      await loadTariffs();
      showSuccess("Tarifa registrada.");
    } catch (error) {
      showError(error);
    }
  });

  function syncPortControls() {
    $("apiPort").value = String(apiPort);
    $("portStatus").textContent = "API local: http://127.0.0.1:" + apiPort;
    const footerPort = $("footerPort");
    if (footerPort) {
      footerPort.textContent = "API 127.0.0.1:" + apiPort;
    }
  }

  async function reloadCurrentView() {
    const active = document.querySelector(".nav-item.active");
    const viewId = active ? active.dataset.view : "dashboard";
    switchView(viewId);
  }

  async function applyPort(port) {
    if (window.electronAPI && window.electronAPI.setSettings) {
      const applied = await window.electronAPI.setSettings({ port: port });
      apiPort = applied.port;
      syncPortControls();
      showSuccess("Puerto actualizado a " + apiPort + ". El backend se reinicio.");
      await reloadCurrentView();
    } else {
      apiPort = port;
      try {
        localStorage.setItem("pesebrera3l-port", String(port));
      } catch (error) {}
      syncPortControls();
      showInfo("Sin puente IPC. El renderer usara el puerto " + port + ". Reinicie el backend manualmente.");
      await reloadCurrentView();
    }
  }

  $("formPort").addEventListener("submit", function (event) {
    event.preventDefault();
    const parsed = Number($("apiPort").value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
      showError(new Error("Ingrese un puerto valido entre 1 y 65535."));
      return;
    }
    applyPort(parsed).catch(showError);
  });

  async function initSettings() {
    if (window.electronAPI && window.electronAPI.getSettings) {
      try {
        const settings = await window.electronAPI.getSettings();
        if (settings && Number.isInteger(settings.port)) {
          apiPort = settings.port;
        }
      } catch (error) {
        // usa 8000
      }
    } else {
      try {
        const saved = Number(localStorage.getItem("pesebrera3l-port"));
        if (Number.isInteger(saved) && saved >= 1 && saved <= 65535) {
          apiPort = saved;
        }
      } catch (error) {}
    }
    syncPortControls();
    setApiStatus("pending", "Iniciando API local · :" + apiPort);
  }

  document.querySelectorAll(".nav-item").forEach(function (button) {
    button.addEventListener("click", function () {
      switchView(button.dataset.view);
    });
  });

  const themeSelect = $("themeSelect");
  const modeSelect = $("modeSelect");
  const dichromacySelect = $("dichromacySelect");

  function currentVisualState() {
    return {
      theme: themeSelect.value,
      mode: modeSelect.value,
      dichromacy: dichromacySelect.value,
    };
  }

  function applyAndSave() {
    const state = ThemeEngine.applyVisualState(document, currentVisualState());
    try {
      localStorage.setItem("pesebrera3l-visual-state", JSON.stringify(state));
    } catch (error) {
      // almacenamiento no disponible; se ignora
    }
  }

  function restoreVisualState() {
    try {
      const saved = JSON.parse(localStorage.getItem("pesebrera3l-visual-state") || "null");
      if (saved) {
        const state = ThemeEngine.normalizeVisualState(saved);
        themeSelect.value = state.theme;
        modeSelect.value = state.mode;
        dichromacySelect.value = state.dichromacy;
        ThemeEngine.applyVisualState(document, state);
        return;
      }
    } catch (error) {
      // nada que restaurar
    }
    applyAndSave();
  }

  [themeSelect, modeSelect, dichromacySelect].forEach(function (element) {
    element.addEventListener("change", applyAndSave);
  });

  restoreVisualState();
  initSettings().then(function () {
    switchView("dashboard");
  });
})();