// v2 main script: data loading + UI wiring

// --- 1. Core data config (from v1) ---

const FILE_ID = "1Qft9FVm9XtT3SVzbgX1NSduPP0sBR3CdGqiUsm-Mmrs";
const getQueryUrl = (gid) =>
  `https://docs.google.com/spreadsheets/d/${FILE_ID}/gviz/tq?tqx=out:json&tq&gid=${gid}&_=${new Date().getTime()}`;

const dataSources = {
  "page-a": getQueryUrl("612819456"),
  "page-b": getQueryUrl("1304436957"),
  "page-c": getQueryUrl("1025885437"),
  "page-d": getQueryUrl("1462843513"),
};

// Demo fallback data (same shape as v1)
const MOCK_DATA_A = [
  {
    計畫編號: "TEST001",
    所屬部會: "行政院",
    主管機關: "國防部",
    計畫名稱: "國防自主強化計畫 (測試資料)",
    預算金額: "5000000000",
    "114年預算金額": "4800000000",
    政事別: "國防",
    工作內容: "測試說明。",
    分支計畫:
      "潛艦國造:3000000000:這是潛艦的詳細說明|無人機研發:2000000000:這是無人機的詳細說明",
    用途比例:
      "人事費:50000000|業務費:30000000|設備及投資:4000000000|獎補助費:10000000|債務費:0|預備金:0",
  },
];

const MOCK_DATA_B = [
  {
    計畫編號: "TEST001",
    計畫名稱: "國防自主強化計畫",
    主管機關: "國防部",
    預算金額: "5000000000",
    刪減金額: "1000000",
    凍結金額: "50000000",
    委員會刪減: "500000",
    委員會凍結: "20000000",
    院會表決刪減: "500000",
    院會表決凍結: "30000000",
    通案刪減: "100000",
    通案凍結: "0",
    提案紀錄: "王小明:凍結:人事費:理由A",
    資料類型: "計畫",
  },
];

const MOCK_DATA_C = [
  {
    委員姓名: "王小明",
    黨籍: "無黨籍",
    刪減案數: "5",
    凍結案數: "10",
    主決議數: "2",
    照片: "",
    更新時間: "2026/01/20",
    提案明細:
      "刪減#國防自主強化計畫 (測試資料)#設備採購#100萬#理由B#TEST001#通過#114/05/20",
  },
];

const MOCK_DATA_D = [
  { 日期: "113/08/22", 事項: "行政院通過總預算案", 連結: "" },
  { 日期: "113/08/30", 事項: "預算案送立法院審議", 連結: "" },
  { 日期: "113/11/08", 事項: "付委審查", 連結: "" },
];

let allDataPageA = [];
let allDataPageB = [];
let allDataPageC = [];
let allDataPageD = [];
let isDemoMode = false;

// Chart instances
let chartStatusInstance = null;

// --- 2. Helpers: money, formatting, toast ---

function parseMoney(str) {
  if (!str) return 0;
  const s = String(str);
  let val = parseFloat(s.replace(/,/g, "").replace(/[^0-9.-]/g, ""));
  if (isNaN(val)) return 0;
  if (s.includes("億")) return val * 100000000;
  if (s.includes("萬")) return val * 10000;
  return val * 1000;
}

function formatCurrency(num) {
  const val = parseFloat(num);
  if (isNaN(val) || val === 0) return "0";
  const absVal = Math.abs(val);
  if (absVal >= 1000000000000) {
    return (val / 1000000000000).toFixed(1).replace(/\.0$/, "") + "兆";
  }
  if (absVal >= 100000000) {
    return (val / 100000000).toFixed(1).replace(/\.0$/, "") + "億";
  }
  if (absVal >= 10000) {
    return (val / 10000).toFixed(1).replace(/\.0$/, "") + "萬";
  }
  return val.toLocaleString() + "元";
}

const tooltipCurrencyCallback = {
  callbacks: {
    label(ctx) {
      let label = ctx.dataset.label || "";
      if (label) label += ": ";
      const value = ctx.raw;
      if (value !== null && value !== undefined) {
        label += formatCurrency(value);
      }
      return label;
    },
  },
};

function showErrorToast(message) {
  const toast = document.getElementById("error-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-active");
  setTimeout(() => toast.classList.remove("is-active"), 4000);
}

// --- 3. Google Sheets gviz helpers ---

function parseQueryResponse(jsonData) {
  const table = jsonData.table;
  const cols = table.cols.map((c) => c.label).filter((l) => l !== "");
  const rows = table.rows;
  return rows.map((row) => {
    const obj = {};
    row.c.forEach((cell, i) => {
      if (cols[i]) {
        obj[cols[i]] = cell && cell.v !== null ? String(cell.v) : "";
      }
    });
    return obj;
  });
}

async function fetchData(pageId, silent = false) {
  const loader = document.getElementById("loader");

  let targetUrl = dataSources[pageId];
  if (pageId === "page-budget") return [];
  if (pageId === "page-legislator") targetUrl = dataSources["page-c"];

  if (!silent && loader) loader.classList.add("is-active");

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const text = await response.text();
    if (text.includes("<!DOCTYPE html>") || text.includes("google.com/accounts")) {
      throw new Error("Login Page Detected (Permissions Error)");
    }

    const jsonText = text.substring(47, text.length - 2);
    const jsonData = JSON.parse(jsonText);

    if (jsonData.status === "error") {
      throw new Error("Google Query API Error: " + JSON.stringify(jsonData.errors));
    }

    const cleanData = parseQueryResponse(jsonData);

    if (pageId === "page-a") allDataPageA = cleanData;
    else if (pageId === "page-b") allDataPageB = cleanData;
    else if (pageId === "page-c") allDataPageC = cleanData;
    else if (pageId === "page-d") allDataPageD = cleanData;

    if (!silent && loader) loader.classList.remove("is-active");
    return cleanData;
  } catch (error) {
    console.warn(`[${pageId}] Fetch failed, using Mock Data.`, error);
    isDemoMode = true;

    let mockData = [];
    if (pageId === "page-a") {
      mockData = MOCK_DATA_A;
      allDataPageA = mockData;
    } else if (pageId === "page-b") {
      mockData = MOCK_DATA_B;
      allDataPageB = mockData;
    } else if (pageId === "page-c") {
      mockData = MOCK_DATA_C;
      allDataPageC = mockData;
    } else if (pageId === "page-d") {
      mockData = MOCK_DATA_D;
      allDataPageD = mockData;
    }

    if (!silent && loader) loader.classList.remove("is-active");
    showErrorToast("無法連線至預算資料庫，已改為示範資料。");
    return mockData;
  }
}

// --- 4. Homepage total status chart + hero summary ---

function updateHeroSummary(totalCut, totalFreeze, totalBudget) {
  const cutAmountEl = document.getElementById("summary-cut-amount");
  const freezeAmountEl = document.getElementById("summary-freeze-amount");
  const cutYoyEl = document.getElementById("summary-cut-yoy");
  const freezeYoyEl = document.getElementById("summary-freeze-yoy");

  if (cutAmountEl) cutAmountEl.textContent = formatCurrency(totalCut);
  if (freezeAmountEl) freezeAmountEl.textContent = formatCurrency(totalFreeze);

  // 目前僅有當年度資料，去年基準暫以「—」表示
  if (cutYoyEl) cutYoyEl.textContent = "—";
  if (freezeYoyEl) freezeYoyEl.textContent = "—";
}

function renderHomeStatusChart() {
  if (!allDataPageA.length || !allDataPageB.length) return;

  // 1. A 表 + 國防部補正
  let rawTotalA = 0;
  let mndExisting = 0;

  allDataPageA.forEach((p) => {
    const amt = parseMoney(p["預算金額"]);
    rawTotalA += amt;
    const id = String(p["計畫編號"] || "").trim();
    if (id.startsWith("0901") || id.startsWith("0902")) {
      mndExisting += amt;
    }
  });

  const mndTarget = 1750857000 + 559611869000;
  const diff = mndTarget - mndExisting;
  const totalBudget = rawTotalA + (diff > 0 ? diff : 0);

  // 2. B 表：刪減 + 凍結
  let totalCut = 0;
  let totalFreeze = 0;
  allDataPageB.forEach((r) => {
    totalCut += parseMoney(r["刪減金額"]);
    totalFreeze += parseMoney(r["凍結金額"]);
  });

  const totalPass = totalBudget - totalCut - totalFreeze;

  updateHeroSummary(totalCut, totalFreeze, totalBudget);

  const canvas = document.getElementById("chartStatusB");
  if (!canvas || typeof Chart === "undefined") return;

  if (chartStatusInstance) chartStatusInstance.destroy();

  chartStatusInstance = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: ["總體審查結果"],
      datasets: [
        { label: "通過", data: [totalPass], backgroundColor: "#315493", barThickness: 40 },
        { label: "凍結", data: [totalFreeze], backgroundColor: "#F0C808", barThickness: 40 },
        { label: "刪減", data: [totalCut], backgroundColor: "#c63f3f", barThickness: 40 },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, display: false, max: totalBudget },
        y: { stacked: true, display: false },
      },
      plugins: {
        legend: { position: "top" },
        tooltip: tooltipCurrencyCallback,
      },
    },
  });
}

// --- 5. Search: simple keyword on Page A ---

function runSimpleSearch(keyword) {
  const input = document.getElementById("search-input");
  const resultsContainer = document.getElementById("search-results");
  const countLabel = document.getElementById("search-count-label");

  const kw = (keyword || (input && input.value) || "").trim();
  if (!resultsContainer || !countLabel) return;

  if (!kw) {
    countLabel.textContent = "尚未搜尋";
    resultsContainer.innerHTML = "";
    return;
  }

  if (!allDataPageA.length) {
    showErrorToast("資料尚未載入完成，請稍後再試一次。");
    return;
  }

  const lower = kw.toLowerCase();
  const fields = ["計畫名稱", "主管機關", "所屬部會", "政事別", "工作內容"];

  const hits = allDataPageA.filter((row) =>
    fields.some((f) => String(row[f] || "").toLowerCase().includes(lower))
  );

  countLabel.textContent = `找到 ${hits.length} 筆與「${kw}」相關的預算計畫`;

  if (!hits.length) {
    resultsContainer.innerHTML =
      '<p style="padding:16px 0;color:#636366;">目前找不到符合條件的預算計畫。</p>';
    return;
  }

  const html = hits
    .slice(0, 50)
    .map((row) => {
      const title = row["計畫名稱"] || "未命名計畫";
      const ministry = row["所屬部會"] || "";
      const agency = row["主管機關"] || "";
      const amount = row["預算金額"] || "";
      const topic = row["政事別"] || "";
      const desc = row["工作內容"] || "";
      return `
        <article class="search-card">
          <h3>${title}</h3>
          <p class="meta">${[ministry, agency].filter(Boolean).join("・")}</p>
          <p class="meta">預算：${formatCurrency(amount)}</p>
          <p class="meta">${topic}</p>
          <p class="desc">${desc}</p>
        </article>
      `;
    })
    .join("");

  resultsContainer.innerHTML = html;
}

// --- 6. Legislator overview (Page C) ---

function renderLegislators(sortMode = "cut-desc") {
  const grid = document.getElementById("legislator-grid");
  if (!grid || !allDataPageC.length) return;

  const toInt = (v) => parseInt(String(v || "0").replace(/[^\d]/g, ""), 10) || 0;

  const sorted = [...allDataPageC].sort((a, b) => {
    if (sortMode === "freeze-desc") {
      return toInt(b["凍結案數"]) - toInt(a["凍結案數"]);
    }
    if (sortMode === "proposal-desc") {
      return toInt(b["主決議數"]) - toInt(a["主決議數"]);
    }
    // default: cut-desc
    return toInt(b["刪減案數"]) - toInt(a["刪減案數"]);
  });

  const html = sorted
    .map((row) => {
      const name = row["委員姓名"] || "未具名立委";
      const party = row["黨籍"] || "";
      const cutCount = row["刪減案數"] || "0";
      const freezeCount = row["凍結案數"] || "0";
      const mainCount = row["主決議數"] || "0";
      const updated = row["更新時間"] || "";
      return `
        <article>
          <h3>${name}</h3>
          <p class="meta">${party}</p>
          <p class="meta">刪減案數：${cutCount}｜凍結案數：${freezeCount}｜主決議：${mainCount}</p>
          <p class="meta">更新：${updated}</p>
        </article>
      `;
    })
    .join("");

  grid.innerHTML = html;
}

// --- 7. UI: smooth scroll + hero wheel ---

function smoothScrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerOffset = 96;
  const rect = el.getBoundingClientRect();
  const targetY = rect.top + window.scrollY - headerOffset;
  window.scrollTo({ top: targetY, behavior: "smooth" });
}

function bindScrollButtons() {
  document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
    const targetId = btn.getAttribute("data-scroll-to");
    if (!targetId) return;
    btn.addEventListener("click", () => smoothScrollToId(targetId));
  });
}

function bindHeroWheel() {
  const list = document.getElementById("hero-nav-list");
  if (!list) return;
  const items = Array.from(list.querySelectorAll("li"));

  function updateOpacity() {
    const viewportMid = window.innerHeight / 2;
    let closestIndex = 0;
    let minDelta = Infinity;

    items.forEach((item, idx) => {
      const targetId = item.getAttribute("data-scroll-to");
      const section = targetId ? document.getElementById(targetId) : null;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionMid = rect.top + rect.height / 2;
      const delta = Math.abs(sectionMid - viewportMid);
      if (delta < minDelta) {
        minDelta = delta;
        closestIndex = idx;
      }
    });

    items.forEach((item, idx) => {
      item.classList.remove("is-active", "is-near");
      if (idx === closestIndex) {
        item.classList.add("is-active");
      } else if (Math.abs(idx - closestIndex) === 1) {
        item.classList.add("is-near");
      }
    });
  }

  items.forEach((item) => {
    const targetId = item.getAttribute("data-scroll-to");
    if (!targetId) return;
    item.addEventListener("click", () => smoothScrollToId(targetId));
  });

  window.addEventListener("scroll", updateOpacity, { passive: true });
  updateOpacity();
}

// --- 8. App bootstrap ---

document.addEventListener("DOMContentLoaded", () => {
  bindScrollButtons();
  bindHeroWheel();

  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => runSimpleSearch());
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runSimpleSearch();
    });
  }

  const legSortSelect = document.getElementById("leg-sort-select");
  if (legSortSelect) {
    legSortSelect.addEventListener("change", () =>
      renderLegislators(legSortSelect.value || "cut-desc")
    );
  }

  (async () => {
    try {
      await Promise.all([
        fetchData("page-a", true),
        fetchData("page-b", true),
        fetchData("page-c", true),
        fetchData("page-d", true),
      ]);
      renderHomeStatusChart();
      renderLegislators("cut-desc");
    } catch (e) {
      console.error(e);
      renderHomeStatusChart();
      renderLegislators("cut-desc");
    }
  })();
});

// v2 main script: data loading + UI wiring

// --- 1. Core data config (from v1) ---

const FILE_ID = "1Qft9FVm9XtT3SVzbgX1NSduPP0sBR3CdGqiUsm-Mmrs";
const getQueryUrl = (gid) =>
  `https://docs.google.com/spreadsheets/d/${FILE_ID}/gviz/tq?tqx=out:json&tq&gid=${gid}&_=${new Date().getTime()}`;

const dataSources = {
  "page-a": getQueryUrl("612819456"),
  "page-b": getQueryUrl("1304436957"),
  "page-c": getQueryUrl("1025885437"),
  "page-d": getQueryUrl("1462843513"),
};

// Demo fallback data
const MOCK_DATA_A = [
  {
    計畫編號: "TEST001",
    所屬部會: "行政院",
    主管機關: "國防部",
    計畫名稱: "國防自主強化計畫 (測試資料)",
    預算金額: "5000000000",
    "114年預算金額": "4800000000",
    政事別: "國防",
    工作內容: "測試說明。",
    分支計畫:
      "潛艦國造:3000000000:這是潛艦的詳細說明|無人機研發:2000000000:這是無人機的詳細說明",
    用途比例:
      "人事費:50000000|業務費:30000000|設備及投資:4000000000|獎補助費:10000000|債務費:0|預備金:0",
  },
];

const MOCK_DATA_B = [
  {
    計畫編號: "TEST001",
    計畫名稱: "國防自主強化計畫",
    主管機關: "國防部",
    預算金額: "5000000000",
    刪減金額: "1000000",
    凍結金額: "50000000",
    委員會刪減: "500000",
    委員會凍結: "20000000",
    院會表決刪減: "500000",
    院會表決凍結: "30000000",
    通案刪減: "100000",
    通案凍結: "0",
    提案紀錄: "王小明:凍結:人事費:理由A",
    資料類型: "計畫",
  },
];

const MOCK_DATA_C = [
  {
    委員姓名: "王小明",
    黨籍: "無黨籍",
    刪減案數: "5",
    凍結案數: "10",
    主決議數: "2",
    照片: "",
    更新時間: "2026/01/20",
    提案明細:
      "刪減#國防自主強化計畫 (測試資料)#設備採購#100萬#理由B#TEST001#通過#114/05/20",
  },
];

const MOCK_DATA_D = [
  { 日期: "113/08/22", 事項: "行政院通過總預算案", 連結: "" },
  { 日期: "113/08/30", 事項: "預算案送立法院審議", 連結: "" },
  { 日期: "113/11/08", 事項: "付委審查", 連結: "" },
];

let allDataPageA = [];
let allDataPageB = [];
let allDataPageC = [];
let allDataPageD = [];
let isDemoMode = false;

// Chart instance
let chartStatusInstance = null;

// --- 2. Helper: money & formatting ---

function parseMoney(str) {
  if (!str) return 0;
  const s = String(str);
  let val = parseFloat(s.replace(/,/g, "").replace(/[^0-9.-]/g, ""));
  if (isNaN(val)) return 0;
  if (s.includes("億")) return val * 100000000;
  if (s.includes("萬")) return val * 10000;
  return val * 1000;
}

function formatCurrency(num) {
  const val = parseFloat(num);
  if (isNaN(val) || val === 0) return "0";
  const absVal = Math.abs(val);
  if (absVal >= 1000000000000) {
    return (val / 1000000000000).toFixed(1).replace(/\.0$/, "") + "兆";
  }
  if (absVal >= 100000000) {
    return (val / 100000000).toFixed(1).replace(/\.0$/, "") + "億";
  }
  if (absVal >= 10000) {
    return (val / 10000).toFixed(1).replace(/\.0$/, "") + "萬";
  }
  return val.toLocaleString() + "元";
}

const tooltipCurrencyCallback = {
  callbacks: {
    label(ctx) {
      let label = ctx.dataset.label || "";
      if (label) label += ": ";
      const value = ctx.raw;
      if (value !== null && value !== undefined) {
        label += formatCurrency(value);
      }
      return label;
    },
  },
};

function showErrorToast(message) {
  const toast = document.getElementById("error-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-active");
  setTimeout(() => toast.classList.remove("is-active"), 4000);
}

// --- 3. Google Sheets gviz helpers ---

function parseQueryResponse(jsonData) {
  const table = jsonData.table;
  const cols = table.cols.map((c) => c.label).filter((l) => l !== "");
  const rows = table.rows;
  return rows.map((row) => {
    const obj = {};
    row.c.forEach((cell, i) => {
      if (cols[i]) {
        obj[cols[i]] = cell && cell.v !== null ? String(cell.v) : "";
      }
    });
    return obj;
  });
}

async function fetchData(pageId, silent = false) {
  const loader = document.getElementById("loader");

  let targetUrl = dataSources[pageId];
  if (pageId === "page-budget") return [];
  if (pageId === "page-legislator") targetUrl = dataSources["page-c"];

  if (!silent && loader) loader.classList.add("is-active");

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const text = await response.text();
    if (text.includes("<!DOCTYPE html>") || text.includes("google.com/accounts")) {
      throw new Error("Login Page Detected (Permissions Error)");
    }

    const jsonText = text.substring(47, text.length - 2);
    const jsonData = JSON.parse(jsonText);

    if (jsonData.status === "error") {
      throw new Error("Google Query API Error: " + JSON.stringify(jsonData.errors));
    }

    const cleanData = parseQueryResponse(jsonData);

    if (pageId === "page-a") allDataPageA = cleanData;
    else if (pageId === "page-b") allDataPageB = cleanData;
    else if (pageId === "page-c") allDataPageC = cleanData;
    else if (pageId === "page-d") allDataPageD = cleanData;

    if (!silent && loader) loader.classList.remove("is-active");
    return cleanData;
  } catch (error) {
    console.warn(`[${pageId}] Fetch failed, using Mock Data.`, error);
    isDemoMode = true;

    let mockData = [];
    if (pageId === "page-a") {
      mockData = MOCK_DATA_A;
      allDataPageA = mockData;
    } else if (pageId === "page-b") {
      mockData = MOCK_DATA_B;
      allDataPageB = mockData;
    } else if (pageId === "page-c") {
      mockData = MOCK_DATA_C;
      allDataPageC = mockData;
    } else if (pageId === "page-d") {
      mockData = MOCK_DATA_D;
      allDataPageD = mockData;
    }

    if (!silent && loader) loader.classList.remove("is-active");
    showErrorToast("無法連線至預算資料庫，已改為示範資料。");
    return mockData;
  }
}

// --- 4. Homepage total status chart + hero summary ---

function updateHeroSummary(totalCut, totalFreeze, totalBudget) {
  const cutAmountEl = document.getElementById("summary-cut-amount");
  const freezeAmountEl = document.getElementById("summary-freeze-amount");
  const cutYoyEl = document.getElementById("summary-cut-yoy");
  const freezeYoyEl = document.getElementById("summary-freeze-yoy");

  if (cutAmountEl) cutAmountEl.textContent = formatCurrency(totalCut);
  if (freezeAmountEl) freezeAmountEl.textContent = formatCurrency(totalFreeze);

  // 目前僅有當年度資料，去年基準暫以「—」表示
  if (cutYoyEl) cutYoyEl.textContent = "—";
  if (freezeYoyEl) freezeYoyEl.textContent = "—";
}

function renderHomeStatusChart() {
  if (!allDataPageA.length || !allDataPageB.length) return;

  // 1. A 表 + 國防部補正
  let rawTotalA = 0;
  let mndExisting = 0;

  allDataPageA.forEach((p) => {
    const amt = parseMoney(p["預算金額"]);
    rawTotalA += amt;
    const id = String(p["計畫編號"] || "").trim();
    if (id.startsWith("0901") || id.startsWith("0902")) {
      mndExisting += amt;
    }
  });

  const mndTarget = 1750857000 + 559611869000;
  const diff = mndTarget - mndExisting;
  const totalBudget = rawTotalA + (diff > 0 ? diff : 0);

  // 2. B 表：刪減 + 凍結
  let totalCut = 0;
  let totalFreeze = 0;
  allDataPageB.forEach((r) => {
    totalCut += parseMoney(r["刪減金額"]);
    totalFreeze += parseMoney(r["凍結金額"]);
  });

  const totalPass = totalBudget - totalCut - totalFreeze;

  updateHeroSummary(totalCut, totalFreeze, totalBudget);

  const canvas = document.getElementById("chartStatusB");
  if (!canvas || typeof Chart === "undefined") return;

  if (chartStatusInstance) chartStatusInstance.destroy();

  chartStatusInstance = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: ["總體審查結果"],
      datasets: [
        { label: "通過", data: [totalPass], backgroundColor: "#315493", barThickness: 40 },
        { label: "凍結", data: [totalFreeze], backgroundColor: "#F0C808", barThickness: 40 },
        { label: "刪減", data: [totalCut], backgroundColor: "#c63f3f", barThickness: 40 },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, display: false, max: totalBudget },
        y: { stacked: true, display: false },
      },
      plugins: {
        legend: { position: "top" },
        tooltip: tooltipCurrencyCallback,
      },
    },
  });
}

// --- 5. UI: smooth scroll + hero wheel ---

function smoothScrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerOffset = 96;
  const rect = el.getBoundingClientRect();
  const targetY = rect.top + window.scrollY - headerOffset;
  window.scrollTo({ top: targetY, behavior: "smooth" });
}

function bindScrollButtons() {
  document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
    const targetId = btn.getAttribute("data-scroll-to");
    if (!targetId) return;
    btn.addEventListener("click", () => smoothScrollToId(targetId));
  });
}

function bindHeroWheel() {
  const list = document.getElementById("hero-nav-list");
  if (!list) return;
  const items = Array.from(list.querySelectorAll("li"));

  function updateOpacity() {
    const viewportMid = window.innerHeight / 2;
    let closestIndex = 0;
    let minDelta = Infinity;

    items.forEach((item, idx) => {
      const targetId = item.getAttribute("data-scroll-to");
      const section = targetId ? document.getElementById(targetId) : null;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionMid = rect.top + rect.height / 2;
      const delta = Math.abs(sectionMid - viewportMid);
      if (delta < minDelta) {
        minDelta = delta;
        closestIndex = idx;
      }
    });

    items.forEach((item, idx) => {
      item.classList.remove("is-active", "is-near");
      if (idx === closestIndex) {
        item.classList.add("is-active");
      } else if (Math.abs(idx - closestIndex) === 1) {
        item.classList.add("is-near");
      }
    });
  }

  items.forEach((item) => {
    const targetId = item.getAttribute("data-scroll-to");
    if (!targetId) return;
    item.addEventListener("click", () => smoothScrollToId(targetId));
  });

  window.addEventListener("scroll", updateOpacity, { passive: true });
  updateOpacity();
}

// --- 6. App bootstrap ---

document.addEventListener("DOMContentLoaded", () => {
  bindScrollButtons();
  bindHeroWheel();

  (async () => {
    try {
      await Promise.all([fetchData("page-a", true), fetchData("page-b", true)]);
      renderHomeStatusChart();
    } catch (e) {
      console.error(e);
      renderHomeStatusChart();
    }
  })();
});

// Minimal scaffolding: smooth scroll & basic UI wiring

function smoothScrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerOffset = 96;
  const rect = el.getBoundingClientRect();
  const targetY = rect.top + window.scrollY - headerOffset;
  window.scrollTo({ top: targetY, behavior: "smooth" });
}

function bindScrollButtons() {
  document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
    const targetId = btn.getAttribute("data-scroll-to");
    if (!targetId) return;
    btn.addEventListener("click", () => smoothScrollToId(targetId));
  });
}

function bindHeroWheel() {
  const list = document.getElementById("hero-nav-list");
  if (!list) return;
  const items = Array.from(list.querySelectorAll("li"));

  function updateOpacity() {
    const viewportMid = window.innerHeight / 2;
    let closestIndex = 0;
    let minDelta = Infinity;

    items.forEach((item, idx) => {
      const targetId = item.getAttribute("data-scroll-to");
      const section = targetId ? document.getElementById(targetId) : null;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionMid = rect.top + rect.height / 2;
      const delta = Math.abs(sectionMid - viewportMid);
      if (delta < minDelta) {
        minDelta = delta;
        closestIndex = idx;
      }
    });

    items.forEach((item, idx) => {
      item.classList.remove("is-active", "is-near");
      if (idx === closestIndex) {
        item.classList.add("is-active");
      } else if (Math.abs(idx - closestIndex) === 1) {
        item.classList.add("is-near");
      }
    });
  }

  items.forEach((item) => {
    const targetId = item.getAttribute("data-scroll-to");
    if (!targetId) return;
    item.addEventListener("click", () => smoothScrollToId(targetId));
  });

  window.addEventListener("scroll", updateOpacity, { passive: true });
  updateOpacity();
}

function toggleLoader(show) {
  const el = document.getElementById("loader");
  if (!el) return;
  el.classList.toggle("is-active", !!show);
}

function showErrorToast(message) {
  const toast = document.getElementById("error-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-active");
  setTimeout(() => toast.classList.remove("is-active"), 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  bindScrollButtons();
  bindHeroWheel();
  toggleLoader(false);
});

