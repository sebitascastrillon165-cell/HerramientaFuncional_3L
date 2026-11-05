(function () {
  "use strict";

  const API_BASE = "http://127.0.0.1:8000";

  function $(id) {
    return document.getElementById(id);
  }

  async function apiRequest(method, path, body) {
    if (window.electronAPI && window.electronAPI.invokeApi) {
      return await window.electronAPI.invokeApi({ method, path, body });
    }
    const response = await fetch(API_BASE + path, {
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
      Swal.fire({ icon: "success", title: "Listo", text: message, timer: 1200, showConfirmButton: false });
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
      el.classList.toggle("active", el.dataset.view === viewId);
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
    }
  }

  function loadDashboard() {
    return apiRequest("GET", "/api/v1/dashboard/")
      .then(function (data) {
        $("statStallsTotal").textContent = data.total_pesebreras;
        $("statStallsAvailable").textContent = data.disponibles_pesebreras;
        $("statStallsFull").textContent = data.llenas_pesebreras;
        $("statRidersActive").textContent = data.montadores_activos;
        $("statRidersAvailable").textContent = data.montadores_disponibles;
        $("statAnimalsTotal").textContent = data.total_animales;
        const list = $("animalsByStall");
        list.innerHTML = "";
        (data.animales_por_pesebrera || []).forEach(function (item) {
          const li = document.createElement("li");
          li.textContent = item.nombre + " (" + item.animales + "/" + item.capacidad + " animales)";
          list.appendChild(li);
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
      select.appendChild(option);
    });
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
          "<td>" + (stall.estado === "disponible" ? "Disponible" : "Llena") + "</td>";
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
          "<td>" + (rider.disponible ? "Si" : "No") + "</td>";
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
        tr.innerHTML =
          "<td>" + animal.id + "</td>" +
          "<td>" + escapeHtml(animal.tipo) + "</td>" +
          "<td>" + escapeHtml(animal.nombre) + "</td>" +
          "<td>" + escapeHtml(animal.raza || "-") + "</td>" +
          "<td>" + (animal.pesebrera_id != null ? animal.pesebrera_id : "-") + "</td>" +
          "<td>" + (animal.montador_id != null ? animal.montador_id : "-") + "</td>" +
          "<td>" + escapeHtml(animal.estado) + "</td>";
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

  $("formStall").addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
      await apiRequest("POST", "/api/v1/pesebreras/", {
        nombre: $("stallName").value.trim(),
        capacidad: Number($("stallCapacity").value),
      });
      $("formStall").reset();
      await loadStalls();
      showSuccess("Pesebrera registrada.");
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
  switchView("dashboard");
})();