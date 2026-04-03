const STORAGE_KEY = "finedge-requests-v1";

const revealItems = document.querySelectorAll(".reveal");
const recordsBody = document.getElementById("records-body");
const emptyState = document.getElementById("empty-state");
const requestForm = document.getElementById("request-form");
const formMessage = document.getElementById("form-message");

const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const sortSelect = document.getElementById("sort-select");

const seedDataBtn = document.getElementById("seed-data-btn");
const clearAllBtn = document.getElementById("clear-all-btn");
const exportJsonBtn = document.getElementById("export-json-btn");
const resetFormBtn = document.getElementById("reset-form-btn");

const totalCountEl = document.getElementById("total-count");
const approvedCountEl = document.getElementById("approved-count");
const pendingCountEl = document.getElementById("pending-count");
const highRiskCountEl = document.getElementById("high-risk-count");

let requests = loadRequests();
let editingId = null;

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

requestForm.addEventListener("submit", onFormSubmit);
searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);
sortSelect.addEventListener("change", render);
seedDataBtn.addEventListener("click", loadDemoData);
clearAllBtn.addEventListener("click", clearAll);
exportJsonBtn.addEventListener("click", exportJson);
resetFormBtn.addEventListener("click", resetForm);

recordsBody.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const rowId = target.dataset.id;
  if (!rowId) {
    return;
  }

  if (target.dataset.action === "delete") {
    deleteRequest(rowId);
    return;
  }

  if (target.dataset.action === "toggle") {
    toggleStatus(rowId);
    return;
  }

  if (target.dataset.action === "edit") {
    startEdit(rowId);
  }
});

render();

function loadRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load saved data", error);
    return [];
  }
}

function saveRequests() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function onFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(requestForm);

  const name = String(formData.get("name") || "").trim();
  const department = String(formData.get("department") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const risk = Number(formData.get("risk"));
  const status = String(formData.get("status") || "pending");

  if (!name || !department || !role || Number.isNaN(risk) || risk < 0 || risk > 100) {
    setFormMessage("Please enter valid values. Risk must be between 0 and 100.", true);
    return;
  }

  if (editingId) {
    requests = requests.map((item) => {
      if (item.id !== editingId) {
        return item;
      }

      return {
        ...item,
        name,
        department,
        role,
        risk,
        status,
      };
    });

    setFormMessage("Request updated successfully.", false);
  } else {
    requests.unshift({
      id: crypto.randomUUID(),
      name,
      department,
      role,
      risk,
      status,
      createdAt: Date.now(),
    });

    setFormMessage("Request saved successfully.", false);
  }

  saveRequests();
  resetForm();
  render();
}

function render() {
  const term = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const sortBy = sortSelect.value;

  let filtered = requests.filter((item) => {
    const searchable = `${item.name} ${item.department} ${item.role}`.toLowerCase();
    const matchesText = !term || searchable.includes(term);
    const matchesStatus = status === "all" || item.status === status;
    return matchesText && matchesStatus;
  });

  filtered = sortRecords(filtered, sortBy);

  recordsBody.innerHTML = filtered
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.department)}</td>
          <td>${escapeHtml(item.role)}</td>
          <td>${item.risk}</td>
          <td><span class="status-pill status-${item.status}">${capitalize(item.status)}</span></td>
          <td class="actions-cell">
            <button class="table-btn" data-action="toggle" data-id="${item.id}">Toggle</button>
            <button class="table-btn" data-action="edit" data-id="${item.id}">Edit</button>
            <button class="table-btn danger" data-action="delete" data-id="${item.id}">Delete</button>
          </td>
        </tr>
      `
    )
    .join("");

  emptyState.style.display = filtered.length ? "none" : "block";
  renderKpis();
}

function sortRecords(items, sortBy) {
  const sorted = [...items];

  if (sortBy === "oldest") {
    sorted.sort((a, b) => a.createdAt - b.createdAt);
    return sorted;
  }

  if (sortBy === "risk-desc") {
    sorted.sort((a, b) => b.risk - a.risk);
    return sorted;
  }

  if (sortBy === "risk-asc") {
    sorted.sort((a, b) => a.risk - b.risk);
    return sorted;
  }

  sorted.sort((a, b) => b.createdAt - a.createdAt);
  return sorted;
}

function renderKpis() {
  const total = requests.length;
  const approved = requests.filter((item) => item.status === "approved").length;
  const pending = requests.filter((item) => item.status === "pending").length;
  const highRisk = requests.filter((item) => item.risk >= 70).length;

  totalCountEl.textContent = String(total);
  approvedCountEl.textContent = String(approved);
  pendingCountEl.textContent = String(pending);
  highRiskCountEl.textContent = String(highRisk);
}

function deleteRequest(id) {
  requests = requests.filter((item) => item.id !== id);
  saveRequests();
  render();
}

function toggleStatus(id) {
  const nextStatus = {
    pending: "approved",
    approved: "rejected",
    rejected: "pending",
  };

  requests = requests.map((item) => {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      status: nextStatus[item.status] || "pending",
    };
  });

  saveRequests();
  render();
}

function startEdit(id) {
  const target = requests.find((item) => item.id === id);
  if (!target) {
    return;
  }

  editingId = id;
  requestForm.elements.name.value = target.name;
  requestForm.elements.department.value = target.department;
  requestForm.elements.role.value = target.role;
  requestForm.elements.risk.value = String(target.risk);
  requestForm.elements.status.value = target.status;
  setFormMessage("Editing mode active. Save to update this request.", false);
  requestForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetForm() {
  requestForm.reset();
  requestForm.elements.risk.value = "35";
  requestForm.elements.status.value = "pending";
  editingId = null;
}

async function loadDemoData() {
  seedDataBtn.disabled = true;
  seedDataBtn.textContent = "Loading...";

  try {
    const response = await fetch("https://randomuser.me/api/?results=8&nat=us,gb,in");
    if (!response.ok) {
      throw new Error("Failed to fetch demo users");
    }

    const payload = await response.json();
    const departments = ["Compliance", "Risk", "Treasury", "Operations", "Fraud", "Audit"];
    const roles = ["Analyst", "Manager", "Reviewer", "Operator", "Specialist"];
    const statuses = ["pending", "approved", "rejected"];

    requests = payload.results.map((user, index) => ({
      id: crypto.randomUUID(),
      name: `${user.name.first} ${user.name.last}`,
      department: departments[index % departments.length],
      role: `${departments[index % departments.length]} ${roles[index % roles.length]}`,
      risk: Math.floor(Math.random() * 101),
      status: statuses[index % statuses.length],
      createdAt: Date.now() - index * 240000,
    }));

    saveRequests();
    render();
    setFormMessage("Demo data loaded from free public API.", false);
  } catch (error) {
    console.error(error);
    requests = fallbackDemoData();
    saveRequests();
    render();
    setFormMessage("Network issue: loaded offline demo data instead.", true);
  } finally {
    seedDataBtn.disabled = false;
    seedDataBtn.textContent = "Load Demo Data";
  }
}

function clearAll() {
  requests = [];
  saveRequests();
  render();
  setFormMessage("All records removed.", false);
}

function exportJson() {
  const blob = new Blob([JSON.stringify(requests, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "finedge-access-requests.json";
  link.click();
  URL.revokeObjectURL(url);
}

function fallbackDemoData() {
  return [
    {
      id: crypto.randomUUID(),
      name: "Ananya Shah",
      department: "Compliance",
      role: "Compliance Analyst",
      risk: 42,
      status: "approved",
      createdAt: Date.now() - 10000,
    },
    {
      id: crypto.randomUUID(),
      name: "Rohan Mehta",
      department: "Risk",
      role: "Risk Reviewer",
      risk: 78,
      status: "pending",
      createdAt: Date.now() - 9000,
    },
    {
      id: crypto.randomUUID(),
      name: "Emma Clark",
      department: "Fraud",
      role: "Fraud Specialist",
      risk: 65,
      status: "rejected",
      createdAt: Date.now() - 8000,
    },
  ];
}

function setFormMessage(message, isError) {
  formMessage.textContent = message;
  formMessage.classList.toggle("error", Boolean(isError));
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
