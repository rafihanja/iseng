/**
 * PulseOps Executive Dashboard Engine — Complete Interactive Architecture
 * Powers Navigation, Modals, Dropdowns, Context Menus, Dynamic Chart.js & Table Management
 */

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ==========================================================================
// 1. Navigation & Page Router
// ==========================================================================
const pages = ["overview", "sales", "crm", "products", "orders", "reports", "settings"];
const titles = {
  overview: "Executive Overview",
  sales: "Sales & Revenue Telemetry",
  crm: "Customers & CRM Matrix",
  products: "Product Catalog & Inventory",
  orders: "Live Order Lifecycle",
  reports: "Executive Audit & Financials",
  settings: "System Settings & API"
};

const subtitles = {
  overview: "Live operational telemetry, automated transaction processing, and multi-channel performance.",
  sales: "Reconcile real-time sales pipelines, recurring MRR/ARR velocity, and gateway settlements.",
  crm: "Segment accounts, monitor customer retention, and manage organizational access.",
  products: "Manage multi-warehouse SKU levels, tiered pricing, and automatic restocking limits.",
  orders: "Track real-time batch fulfillment, automated courier webhooks, and refund disputes.",
  reports: "Export GAAP-compliant financial summaries, investor briefings, and balance sheets.",
  settings: "Configure OAuth2 SSO, rotate production API keys, and manage RBAC policies."
};

function showPage(page) {
  if (!pages.includes(page)) page = "overview";

  pages.forEach(p => {
    const el = document.getElementById(p + "Page");
    if (el) el.classList.toggle("hidden", p !== page);
  });

  $$(".nav-link").forEach(a => {
    const isActive = a.dataset.page === page;
    a.classList.toggle("active", isActive);
  });

  const headingEl = $("#heading");
  const subHeadingEl = $("#subheading");
  if (headingEl) headingEl.textContent = titles[page];
  if (subHeadingEl) subHeadingEl.textContent = subtitles[page];

  // If navigating to orders tab, sync full table
  if (page === "orders") {
    syncOrdersFullTable();
  }

  history.replaceState(null, "", "#" + page);
  closeSidebar();
  closeAllDropdowns();
}

// Global Link & Nav Listener (Handles .nav-link, .link-action, and KPI Cards)
document.addEventListener("click", e => {
  const target = e.target.closest("a, button, .kpi-card, .catalog-item");
  if (!target) return;

  // If clicking on KPI card with data-nav
  if (target.dataset && target.dataset.nav) {
    showPage(target.dataset.nav);
    return;
  }

  // If clicking on catalog item on overview
  if (target.classList.contains("catalog-item") && target.dataset.product) {
    showPage("products");
    toast(`Inspecting catalog item: ${target.dataset.product}`, "📦");
    return;
  }

  // If clicking anchor link with hash
  if (target.tagName === "A" && target.getAttribute("href") && target.getAttribute("href").startsWith("#")) {
    const page = target.getAttribute("href").slice(1);
    if (pages.includes(page)) {
      e.preventDefault();
      showPage(page);
    }
  }
});

window.addEventListener("hashchange", () => {
  const h = (location.hash || "#overview").slice(1);
  if (pages.includes(h)) showPage(h);
});

// Mobile Sidebar Drawer
const sidebar = $("#sidebar");
const sidebarBackdrop = $("#sidebarBackdrop");
const menuBtn = $("#menuBtn");

function toggleSidebar() {
  sidebar.classList.toggle("open");
  if (sidebarBackdrop) sidebarBackdrop.classList.toggle("active");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
}

if (menuBtn) menuBtn.addEventListener("click", toggleSidebar);
if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeSidebar);

// ==========================================================================
// 2. Toast Notification Feedback System
// ==========================================================================
let toastTimer = null;
function toast(message, icon = "✓") {
  const el = $("#toast");
  if (!el) return;
  el.innerHTML = `<span style="font-size: 1.1em">${icon}</span> <span>${message}</span>`;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("show");
  }, 2600);
}

// ==========================================================================
// 3. Dropdowns & Header Popups
// ==========================================================================
const notifBtn = $("#notifBtn");
const notifDropdown = $("#notifDropdown");
const clearNotifBtn = $("#clearNotifBtn");
const notifBadge = $("#notifBadge");

const userProfileBtn = $("#userProfileBtn");
const profileDropdown = $("#profileDropdown");
const logoutBtn = $("#logoutBtn");

function closeAllDropdowns() {
  if (notifDropdown) notifDropdown.classList.remove("show");
  if (profileDropdown) profileDropdown.classList.remove("show");
  closeContextMenu();
}

if (notifBtn) {
  notifBtn.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = notifDropdown.classList.contains("show");
    closeAllDropdowns();
    if (!isOpen) notifDropdown.classList.add("show");
  });
}

if (clearNotifBtn) {
  clearNotifBtn.addEventListener("click", e => {
    e.stopPropagation();
    $$(".notif-item.unread").forEach(item => item.classList.remove("unread"));
    if (notifBadge) notifBadge.classList.add("hidden");
    toast("All notifications marked as read", "✓");
  });
}

if (userProfileBtn) {
  userProfileBtn.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = profileDropdown.classList.contains("show");
    closeAllDropdowns();
    if (!isOpen) profileDropdown.classList.add("show");
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    closeAllDropdowns();
    toast("Session locked. Re-authenticate to access executive console.", "🔒");
  });
}

const brandSwitcher = $("#brandSwitcher");
if (brandSwitcher) {
  brandSwitcher.addEventListener("click", () => {
    toast("Switched to Workspace: Acme Digital HQ (Production)", "🏢");
  });
}

const telemetryStatusBtn = $("#telemetryStatusBtn");
if (telemetryStatusBtn) {
  telemetryStatusBtn.addEventListener("click", () => {
    toast("Telemetry Engine: 99.99% Uptime, 0.02s API Latency", "⚡");
  });
}

// ==========================================================================
// 4. Modals & Dialogs (New Transaction, Add Product, Upgrade Pro)
// ==========================================================================
const txModal = $("#txModal");
const addTxBtn = $("#addTxBtn");
const createOrderBtn = $("#createOrderBtn");
const closeTxModal = $("#closeTxModal");
const cancelTxBtn = $("#cancelTxBtn");
const txForm = $("#txForm");

function openTxModal() {
  closeAllDropdowns();
  txModal.classList.add("show");
  const custInput = $("#txCustomerName");
  if (custInput) custInput.focus();
}

function closeTxModalDialog() {
  txModal.classList.remove("show");
  if (txForm) txForm.reset();
}

if (addTxBtn) addTxBtn.addEventListener("click", openTxModal);
if (createOrderBtn) createOrderBtn.addEventListener("click", openTxModal);
if (closeTxModal) closeTxModal.addEventListener("click", closeTxModalDialog);
if (cancelTxBtn) cancelTxBtn.addEventListener("click", closeTxModalDialog);

// Save New Transaction
if (txForm) {
  txForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#txCustomerName").value.trim();
    const email = $("#txCustomerEmail").value.trim();
    const amount = Number($("#txAmount").value);
    const status = $("#txStatus").value;

    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AM";
    const refCode = "#ORD-" + Math.floor(10000 + Math.random() * 90000);
    const formattedAmount = "Rp " + amount.toLocaleString("id-ID");

    const statusClass = status === "Settled" ? "chip-completed" : status === "Processing" ? "chip-processing" : "chip-failed";
    const avatarGradients = ["av-blue", "av-emerald", "av-purple", "av-amber"];
    const chosenAv = avatarGradients[Math.floor(Math.random() * avatarGradients.length)];

    const rowHtml = `
      <tr data-ref="${refCode}" class="new-row-anim">
        <td><span class="ref-code">${refCode}</span></td>
        <td>
          <div class="customer-cell">
            <div class="c-avatar ${chosenAv}">${initials}</div>
            <div class="c-meta">
              <span class="c-name">${name}</span>
              <span class="c-email">${email}</span>
            </div>
          </div>
        </td>
        <td><span class="timestamp-tag">Just now</span></td>
        <td class="amount-cell">${formattedAmount}</td>
        <td><span class="chip-status ${statusClass}">${status}</span></td>
        <td class="text-right">
          <button class="row-action-btn action-menu-btn" data-order="${refCode}" title="Options">•••</button>
        </td>
      </tr>
    `;

    const overviewTable = $("#orderTable");
    if (overviewTable) overviewTable.insertAdjacentHTML("afterbegin", rowHtml);

    // Update KPI count
    const kpiOrdersVal = $("#kpiOrdersVal");
    if (kpiOrdersVal) {
      const current = parseInt(kpiOrdersVal.textContent.replace(/\D/g, "")) || 8549;
      kpiOrdersVal.textContent = (current + 1).toLocaleString("id-ID");
    }

    closeTxModalDialog();
    toast(`Transaction ${refCode} recorded successfully!`, "💳");
  });
}

// Add Product Modal
const productModal = $("#productModal");
const addProductBtn = $("#addProductBtn");
const closeProductModal = $("#closeProductModal");
const cancelProductBtn = $("#cancelProductBtn");
const productForm = $("#productForm");

function openProductModal() {
  productModal.classList.add("show");
  const prodNameInput = $("#prodName");
  if (prodNameInput) prodNameInput.focus();
}

function closeProductModalDialog() {
  productModal.classList.remove("show");
  if (productForm) productForm.reset();
}

if (addProductBtn) addProductBtn.addEventListener("click", openProductModal);
if (closeProductModal) closeProductModal.addEventListener("click", closeProductModalDialog);
if (cancelProductBtn) cancelProductBtn.addEventListener("click", closeProductModalDialog);

if (productForm) {
  productForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#prodName").value.trim();
    const cat = $("#prodCategory").value;
    const price = Number($("#prodPrice").value);
    const stock = Number($("#prodStock").value);

    const skuId = "SKU-" + Math.floor(1000 + Math.random() * 9000);
    const formattedPrice = "Rp " + price.toLocaleString("id-ID");

    const rowHtml = `
      <tr class="new-row-anim">
        <td><span class="ref-code">${skuId}</span></td>
        <td><strong>${name}</strong></td>
        <td>${cat}</td>
        <td>${formattedPrice}</td>
        <td>${stock} Units</td>
        <td><span class="chip-status chip-completed">In Stock</span></td>
        <td class="text-right"><button class="btn btn-secondary btn-sm" onclick="toast('Editing ${skuId} details', '📦')">Edit</button></td>
      </tr>
    `;

    const prodTable = $("#productCatalogTable");
    if (prodTable) prodTable.insertAdjacentHTML("afterbegin", rowHtml);

    closeProductModalDialog();
    toast(`Product SKU ${skuId} (${name}) added to catalog!`, "📦");
  });
}

// Upgrade Modal
const upgradeModal = $("#upgradeModal");
const upgradeBtn = $("#upgradeBtn");
const closeUpgradeModal = $("#closeUpgradeModal");

if (upgradeBtn) {
  upgradeBtn.addEventListener("click", () => upgradeModal.classList.add("show"));
}
if (closeUpgradeModal) {
  closeUpgradeModal.addEventListener("click", () => upgradeModal.classList.remove("show"));
}
$$(".select-plan-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    upgradeModal.classList.remove("show");
    toast(`Tier changed to ${btn.dataset.plan} Cloud Infrastructure!`, "🚀");
  });
});

// ==========================================================================
// 5. Context Menu for Row Actions
// ==========================================================================
const contextMenu = $("#rowContextMenu");
let activeOrderTarget = null;

function closeContextMenu() {
  if (contextMenu) contextMenu.classList.remove("show");
  activeOrderTarget = null;
}

document.addEventListener("click", e => {
  const moreBtn = e.target.closest(".action-menu-btn");
  if (moreBtn) {
    e.stopPropagation();
    closeAllDropdowns();
    activeOrderTarget = moreBtn.closest("tr");
    const rect = moreBtn.getBoundingClientRect();
    contextMenu.style.top = `${rect.bottom + window.scrollY + 4}px`;
    contextMenu.style.left = `${Math.min(rect.left + window.scrollX - 120, window.innerWidth - 200)}px`;
    contextMenu.classList.add("show");
    return;
  }

  // Close when clicking outside
  if (!e.target.closest(".dropdown-panel") && !e.target.closest(".context-menu")) {
    closeAllDropdowns();
  }
});

if (contextMenu) {
  contextMenu.addEventListener("click", e => {
    const item = e.target.closest(".context-item");
    if (!item || !activeOrderTarget) return;
    const action = item.dataset.action;
    const orderRef = activeOrderTarget.querySelector(".ref-code")?.textContent || "#ORD-XXXXX";

    if (action === "view") {
      toast(`Inspecting ledger details for ${orderRef}`, "👁️");
    } else if (action === "settle") {
      const chip = activeOrderTarget.querySelector(".chip-status");
      if (chip) {
        chip.className = "chip-status chip-completed";
        chip.textContent = "Settled";
      }
      toast(`Status for ${orderRef} updated to Settled`, "✓");
    } else if (action === "receipt") {
      toast(`Tax invoice PDF generated for ${orderRef}`, "📄");
    } else if (action === "refund") {
      const chip = activeOrderTarget.querySelector(".chip-status");
      if (chip) {
        chip.className = "chip-status chip-failed";
        chip.textContent = "Refunded";
      }
      toast(`Refund processed for ${orderRef}`, "🔄");
    } else if (action === "delete") {
      activeOrderTarget.remove();
      toast(`Ledger record ${orderRef} deleted`, "🗑️");
    }
    closeContextMenu();
  });
}

// Sync orders table between Overview and Orders Tab
function syncOrdersFullTable() {
  const overviewRows = $("#orderTable")?.innerHTML;
  const fullTable = $("#ordersFullTable");
  if (overviewRows && fullTable) {
    fullTable.innerHTML = overviewRows;
  }
}

// ==========================================================================
// 6. Sub-Page Buttons & Form Actions
// ==========================================================================
const newPipelineBtn = $("#newPipelineBtn");
if (newPipelineBtn) {
  newPipelineBtn.addEventListener("click", () => {
    toast("Pipeline creation wizard opened", "📈");
  });
}

const inviteMemberBtn = $("#inviteMemberBtn");
if (inviteMemberBtn) {
  inviteMemberBtn.addEventListener("click", () => {
    toast("Organization member invitation link generated", "✉️");
  });
}

const exportSalesBtn = $("#exportSalesBtn");
if (exportSalesBtn) {
  exportSalesBtn.addEventListener("click", () => {
    toast("Reconciliation report downloaded", "📥");
  });
}

const generateReportBtn = $("#generateReportBtn");
if (generateReportBtn) {
  generateReportBtn.addEventListener("click", () => {
    const period = $("#reportPeriodSelect")?.value || "2026";
    const format = $("#reportFormatSelect")?.value || "pdf";
    const type = $("#reportTypeSelect")?.value || "P&L";

    toast(`Generated ${type} (${period}) as ${format.toUpperCase()}`, "📊");
  });
}

// API Key Tools
const toggleApiKeyBtn = $("#toggleApiKeyBtn");
const apiKeyInput = $("#apiKeyInput");
const copyApiKeyBtn = $("#copyApiKeyBtn");
const rotateKeyBtn = $("#rotateKeyBtn");

if (toggleApiKeyBtn && apiKeyInput) {
  toggleApiKeyBtn.addEventListener("click", () => {
    const isPass = apiKeyInput.type === "password";
    apiKeyInput.type = isPass ? "text" : "password";
    toggleApiKeyBtn.textContent = isPass ? "Hide" : "Reveal";
  });
}

if (copyApiKeyBtn && apiKeyInput) {
  copyApiKeyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(apiKeyInput.value).then(() => {
      toast("API Key copied to clipboard", "📋");
    }).catch(() => {
      toast("API Key copied", "📋");
    });
  });
}

if (rotateKeyBtn && apiKeyInput) {
  rotateKeyBtn.addEventListener("click", () => {
    const newKey = "pulseops_live_" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    apiKeyInput.value = newKey;
    toast("Production API key successfully rotated!", "🔑");
  });
}

const saveSettingsBtn = $("#saveSettingsBtn");
if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener("click", () => {
    toast("Environment preferences & 2FA policies saved!", "✓");
  });
}

// ==========================================================================
// 7. Live Search & CSV Export
// ==========================================================================
const searchInput = $("#globalSearch");
if (searchInput) {
  searchInput.addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    $$("#orderTable tr, #ordersFullTable tr, #crmTable tr, #productCatalogTable tr").forEach(row => {
      const isMatch = row.textContent.toLowerCase().includes(q);
      row.style.display = isMatch ? "" : "none";
    });
  });

  window.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      searchInput.focus();
      toast("Command search active — type order, customer, or SKU", "⚡");
    }
  });
}

function exportCsvLedger() {
  const rows = [
    ["Order Reference", "Customer Name", "Email", "Timestamp", "Amount (IDR)", "Status"],
    ["#ORD-82914", "Budi Santoso", "budi.santoso@enterprise.co.id", "09 Aug 2026 14:32 WIB", "2450000", "Settled"],
    ["#ORD-82913", "Andi Pratama", "andi.p@fintechcorp.id", "09 Aug 2026 11:15 WIB", "1875000", "Processing"],
    ["#ORD-82912", "Siti Rahma", "siti.rahma@cloudstudio.com", "08 Aug 2026 19:40 WIB", "3120000", "Settled"],
    ["#ORD-82911", "Dewi Wulandari", "dewi.wulan@globaltrade.id", "08 Aug 2026 16:05 WIB", "950000", "Refunded"]
  ];

  const csvContent = "\uFEFF" + rows.map(r => r.map(c => `"${c}"`).join(",")).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `excore-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast("Transactions ledger exported to CSV format", "📥");
}

const exportBtn = $("#exportBtn");
if (exportBtn) exportBtn.addEventListener("click", exportCsvLedger);

const exportOrdersTabBtn = $("#exportOrdersTabBtn");
if (exportOrdersTabBtn) exportOrdersTabBtn.addEventListener("click", exportCsvLedger);

// Segmented Range Control
$$(".segmented-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".segmented-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const range = btn.dataset.range;
    
    // Dynamic KPI Updates based on range
    const kpiRev = $("#kpiRevenueVal");
    const kpiOrd = $("#kpiOrdersVal");
    if (range === "today") {
      if (kpiRev) kpiRev.textContent = "Rp 14,80 M";
      if (kpiOrd) kpiOrd.textContent = "284";
    } else if (range === "7d") {
      if (kpiRev) kpiRev.textContent = "Rp 98,20 M";
      if (kpiOrd) kpiOrd.textContent = "1,942";
    } else {
      if (kpiRev) kpiRev.textContent = "Rp 428,50 M";
      if (kpiOrd) kpiOrd.textContent = "8,549";
    }

    toast(`Telemetry range synced: ${btn.textContent}`, "⏱️");
  });
});

// ==========================================================================
// 8. Dual-Metric Revenue Chart Engine
// ==========================================================================
let revenueChart = null;

function getChartTokens(isDark) {
  return {
    grid: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)",
    ticks: isDark ? "#64748b" : "#94a3b8",
    actualLine: "#6366f1",
    actualFill: isDark ? "rgba(99, 102, 241, 0.18)" : "rgba(99, 102, 241, 0.1)",
    targetLine: "#a855f7"
  };
}

function initRevenueChart() {
  const canvas = $("#revenueChart");
  if (!canvas || typeof Chart === "undefined") return;

  const isDark = document.documentElement.classList.contains("dark");
  const tokens = getChartTokens(isDark);
  const ctx = canvas.getContext("2d");

  revenueChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      datasets: [
        {
          label: "Actual Revenue (IDR M)",
          data: [42, 58, 51, 76, 68, 91],
          borderColor: tokens.actualLine,
          backgroundColor: tokens.actualFill,
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: tokens.actualLine,
          pointBorderColor: isDark ? "#090d16" : "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: "Target Trajectory",
          data: [40, 50, 60, 70, 80, 90],
          borderColor: tokens.targetLine,
          borderDash: [5, 5],
          borderWidth: 1.8,
          fill: false,
          tension: 0.35,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index"
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          titleColor: isDark ? "#f8fafc" : "#0f172a",
          bodyColor: isDark ? "#cbd5e1" : "#475569",
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
          borderWidth: 1,
          padding: 10,
          borderRadius: 8,
          callbacks: {
            label: (item) => ` ${item.dataset.label}: Rp ${item.parsed.y} M`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: tokens.grid },
          ticks: {
            color: tokens.ticks,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 },
            callback: v => "Rp " + v + "M"
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            color: tokens.ticks,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 }
          }
        }
      }
    }
  });
}

function updateChartTheme() {
  if (!revenueChart) return;
  const isDark = document.documentElement.classList.contains("dark");
  const tokens = getChartTokens(isDark);

  revenueChart.data.datasets[0].backgroundColor = tokens.actualFill;
  revenueChart.options.scales.y.grid.color = tokens.grid;
  revenueChart.options.scales.y.ticks.color = tokens.ticks;
  revenueChart.options.scales.x.ticks.color = tokens.ticks;
  revenueChart.options.plugins.tooltip.backgroundColor = isDark ? "#0f172a" : "#ffffff";
  revenueChart.options.plugins.tooltip.titleColor = isDark ? "#f8fafc" : "#0f172a";
  revenueChart.options.plugins.tooltip.bodyColor = isDark ? "#cbd5e1" : "#475569";
  revenueChart.update();
}

// Chart Period Filter
const periodSelect = $("#chartPeriod");
if (periodSelect) {
  periodSelect.addEventListener("change", e => {
    if (!revenueChart) return;
    const datasets = {
      "6 Bulan": [42, 58, 51, 76, 68, 91],
      "12 Bulan": [34, 40, 48, 45, 55, 61, 58, 70, 66, 78, 84, 91],
      "30 Hari": [25, 32, 28, 44, 38, 51, 49, 62, 57, 69, 65, 74]
    };
    const targets = {
      "6 Bulan": [40, 50, 60, 70, 80, 90],
      "12 Bulan": [30, 38, 45, 50, 58, 65, 62, 72, 70, 80, 85, 95],
      "30 Hari": [20, 28, 30, 40, 42, 48, 52, 58, 60, 68, 70, 78]
    };
    const labelsMap = {
      "6 Bulan": ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      "12 Bulan": ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      "30 Hari": ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28", "30"]
    };

    const val = e.target.value;
    revenueChart.data.labels = labelsMap[val] || labelsMap["6 Bulan"];
    revenueChart.data.datasets[0].data = datasets[val] || datasets["6 Bulan"];
    revenueChart.data.datasets[1].data = targets[val] || targets["6 Bulan"];
    revenueChart.update();
    toast(`Revenue timeframe synced: ${val}`, "📈");
  });
}

// Dark / Light Mode Switcher
const themeBtn = $("#themeBtn");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("excore_theme", isDark ? "dark" : "light");
    updateChartTheme();
    toast(`Theme changed to ${isDark ? "Obsidian Dark 🌙" : "Clean Light ☀️"}`);
  });
}

// Load saved theme
const savedTheme = localStorage.getItem("excore_theme");
if (savedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

// Initialize on DOM Ready
window.addEventListener("DOMContentLoaded", () => {
  const initialHash = (location.hash || "#overview").slice(1);
  showPage(initialHash);
  initRevenueChart();
});
