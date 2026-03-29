let trades = JSON.parse(localStorage.getItem("trades")) || [];

// MIGRATE OLD DATA
trades = trades.map((trade) => {
  if (Array.isArray(trade.checklist)) return trade;

  if (trade.checklistPassed === true) {
    return {
      ...trade,
      checklist: ["htf", "entry", "risk", "emotion"],
    };
  }

  return {
    ...trade,
    checklist: [],
  };
});

// SAVE CLEAN VERSION
localStorage.setItem("trades", JSON.stringify(trades));

let editingIndex = null;
let selectedDirection = null;
let selectedTimeframe = null;

const timeframeButtons = document.querySelectorAll(
  "#timeframeToggle .toggle-btn",
);

const directionButtons = document.querySelectorAll(
  "#directionToggle .toggle-btn",
);

// CHECKLIST CLICK SYNC
document.querySelectorAll(".checklist-rule").forEach((input) => {
  input.addEventListener("change", () => {
    const card = input.closest(".check-card");
    if (card) {
      card.classList.toggle("active", input.checked);
    }
  });
});

const form = document.getElementById("tradeForm");
const tradeList = document.getElementById("tradeList");
const totalTradesEl = document.getElementById("totalTrades");
const winRateEl = document.getElementById("winRate");
const avgREl = document.getElementById("avgR");
const expectancyEl = document.getElementById("expectancy");

document.querySelectorAll('input[name="setup"]').forEach((input) => {
  input.addEventListener("change", () => {
    console.log("Selected:", input.value);
  });
});

function validateChecklist() {
  const rules = document.querySelectorAll(".checklist-rule");

  return Array.from(rules).every((rule) => rule.checked);
}

function getSelectedSetup() {
  const selected = document.querySelector('input[name="setup"]:checked');
  return selected ? selected.value : null;
}

function saveTrades() {
  localStorage.setItem("trades", JSON.stringify(trades));
}

function calculateStats() {
  const closedTrades = trades.filter(
    (trade) => trade.status === "closed" || trade.status === undefined,
  );

  const total = closedTrades.length;

  if (total === 0) {
    totalTradesEl.textContent = trades.length;
    winRateEl.textContent = "0%";
    avgREl.textContent = 0;
    expectancyEl.textContent = 0;

    [winRateEl, avgREl, expectancyEl].forEach((el) => {
      el.classList.remove("positive", "negative", "neutral");
      el.classList.add("neutral");
    });

    return;
  }

  let wins = 0;
  let totalR = 0;

  closedTrades.forEach((trade) => {
    const r = Number(trade.result);
    totalR += r;
    if (r > 0) wins++;
  });

  const winRate = (wins / total) * 100;
  const avgR = totalR / total;
  const expectancy = avgR;

  totalTradesEl.textContent = total;
  winRateEl.textContent = `${winRate.toFixed(1)}%`;
  avgREl.textContent = avgR.toFixed(2);
  expectancyEl.textContent = expectancy.toFixed(2);

  applyStatColor(winRateEl, winRate, 50);
  applyStatColor(avgREl, avgR, 0);
  applyStatColor(expectancyEl, expectancy, 0);
}

function applyStatColor(element, value, threshold = 0) {
  element.classList.remove("positive", "negative", "neutral");

  if (value > threshold) {
    element.classList.add("positive");
  } else if (value < threshold) {
    element.classList.add("negative");
  } else {
    element.classList.add("neutral");
  }
}

function renderTrades() {
  tradeList.innerHTML = "";

  if (trades.length === 0) {
    tradeList.innerHTML = "<p>No trades logged yet.</p>";
    calculateStats();
    return;
  }

  trades.forEach((trade, index) => {
    const div = document.createElement("div");
    div.classList.add("card", "trade-card");

    div.innerHTML = `

  <!-- TOP BAR -->
  <div class="trade-header">
    <div>
      <strong>${trade.market}</strong>
      <span class="muted">${trade.timeframe} • ${trade.direction}</span>
    </div>

    <div class="trade-result ${trade.result > 0 ? "win" : "loss"}">
      ${trade.status === "open" ? "🟡 Open" : `${trade.result}R`}
    </div>
  </div>

  <!-- SETUPS -->
  <div class="setups">
   <span class="tag">${trade.setup}</span>
  </div>

  <!-- CORE INFO -->
  <div class="trade-grid">
    <div><span class="label">Date</span><span>${trade.date ? new Date(trade.date).toLocaleDateString() : "N/A"}</span></div>
    <div><span class="label">Bias</span><span>${trade.bias || "-"}</span></div>
    <div><span class="label">Risk</span><span>${trade.risk}%</span></div>
  </div>

  <!-- COMMENTS -->
  ${
    trade.comments
      ? `
    <div class="trade-note">
      ${trade.comments}
    </div>
  `
      : ""
  }

  <!-- CHECKLIST -->
  <div class="trade-checklist">
    <span class="label">Checklist</span>
    <span>
      ${
        trade.checklistPassed === true
          ? "✅ Passed"
          : trade.checklistPassed === false
            ? "❌ Failed"
            : "Not recorded"
      }
    </span>
  </div>

  <!-- ACTIONS -->
  <div class="trade-actions">
    <button class="edit-btn" data-index="${index}">Edit</button>
    <button class="delete-btn" data-index="${index}">Delete</button>
  </div>

`;
    tradeList.appendChild(div);
  });
  calculateStats();
}

function loadTradeIntoForm(index) {
  console.log("Edit clicked", index);

  const rawTrade = trades[index];

  // NORMALIZE DATA (kills undefined errors)
  const trade = {
    ...rawTrade,
    checklist: Array.isArray(rawTrade.checklist) ? rawTrade.checklist : [],
    setup: rawTrade.setup || "",
    direction: rawTrade.direction || "",
    timeframe: rawTrade.timeframe || "",
  };

  editingIndex = index;

  // =========================
  // 1. HARD RESET EVERYTHING
  // =========================

  // checklist
  document.querySelectorAll(".checklist-rule").forEach((input) => {
    input.checked = false;

    const card = input.closest(".check-card");
    if (card) card.classList.remove("active");
  });

  // setup radios
  document.querySelectorAll('input[name="setup"]').forEach((input) => {
    input.checked = false;
  });

  // toggles
  directionButtons.forEach((btn) => btn.classList.remove("active"));
  timeframeButtons.forEach((btn) => btn.classList.remove("active"));

  // =========================
  // 2. RESTORE INPUT VALUES
  // =========================

  document.getElementById("market").value = trade.market || "";
  document.getElementById("bias").value = trade.bias || "";
  document.getElementById("risk").value = trade.risk || "";
  document.getElementById("result").value = trade.result || "";
  document.getElementById("comments").value = trade.comments || "";

  // =========================
  // 3. RESTORE CHECKLIST (ONLY ONCE)
  // =========================

  document.querySelectorAll(".checklist-rule").forEach((input) => {
    const isChecked = trade.checklist.includes(input.value);

    input.checked = isChecked;

    const card = input.closest(".check-card");
    if (card) {
      card.classList.toggle("active", isChecked);
    }
  });

  // =========================
  // 4. RESTORE SETUP
  // =========================

  if (trade.setup) {
    const setupInput = document.querySelector(
      `input[name="setup"][value="${trade.setup}"]`,
    );
    if (setupInput) setupInput.checked = true;
  }

  // =========================
  // 5. RESTORE TOGGLES
  // =========================

  selectedDirection = trade.direction;
  selectedTimeframe = trade.timeframe;

  directionButtons.forEach((btn) => {
    if (btn.dataset.value === trade.direction) {
      btn.classList.add("active");
    }
  });

  timeframeButtons.forEach((btn) => {
    if (btn.dataset.value === trade.timeframe) {
      btn.classList.add("active");
    }
  });

  // =========================
  // 6. UI STATE
  // =========================

  const form = document.querySelector("#tradeForm");

  if (form) {
    form.classList.add("editing");
    form.scrollIntoView({ behavior: "smooth" });
  }
}

tradeList.addEventListener("click", function (e) {
  const index = e.target.getAttribute("data-index");

  if (e.target.classList.contains("delete-btn")) {
    trades.splice(index, 1);
    saveTrades();
    renderTrades();
  }

  if (e.target.classList.contains("edit-btn")) {
    loadTradeIntoForm(index);
  }
});

directionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedDirection = btn.dataset.value;

    directionButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

timeframeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedTimeframe = btn.dataset.value;

    timeframeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const setup = getSelectedSetup();
  const commentsInput = document.getElementById("comments").value.trim();

  const checklist = Array.from(
    document.querySelectorAll(".checklist-rule:checked"),
  ).map((input) => input.value);

  form.classList.remove("editing");

  if (!setup) {
    alert("Select a setup.");
    return;
  }

  if (!selectedDirection) {
    alert("Select Buy or Sell.");
    return;
  }

  if (!selectedTimeframe) {
    alert("Select a timeframe.");
    return;
  }

  if (!validateChecklist()) {
    alert("You are breaking your rules.");
    return;
  }

  const trade = {
    id: Date.now(),
    date: new Date().toISOString(),
    market: document.getElementById("market").value,
    timeframe: selectedTimeframe,
    direction: selectedDirection,
    setup: setup,
    risk: Number(document.getElementById("risk").value),

    result: null,
    status: "open",

    checklist: checklist,
    checklistPassed: checklist.length === 4,

    comments: commentsInput,
  };

  if (editingIndex !== null) {
    const existingTrade = trades[editingIndex];

    existingTrade.market = document.getElementById("market").value;
    existingTrade.timeframe = selectedTimeframe;
    existingTrade.direction = selectedDirection;
    existingTrade.setup = setup;
    existingTrade.risk = Number(document.getElementById("risk").value);
    existingTrade.comments = commentsInput;
    existingTrade.bias =
      document.getElementById("bias").value || existingTrade.bias;

    existingTrade.checklist = checklist;
    existingTrade.checklistPassed = checklist.length === 4;

    // optional (only if you're still using it here)
    existingTrade.result =
      Number(document.getElementById("result").value) || null;
    existingTrade.status = existingTrade.result !== null ? "closed" : "open";

    editingIndex = null;
  } else {
    trades.unshift(trade);
  }

  document.getElementById("comments").value = "";

  form.reset();

  // reset toggles
  selectedDirection = null;
  selectedTimeframe = null;

  directionButtons.forEach((b) => b.classList.remove("active"));
  timeframeButtons.forEach((b) => b.classList.remove("active"));

  // reset checklist (UI + state)
  document.querySelectorAll(".checklist-rule").forEach((input) => {
    input.checked = false;

    const card = input.closest(".check-card");
    if (card) {
      card.classList.remove("active");
    }
  });

  // exit edit mode
  form.classList.remove("editing");
  editingIndex = null;

  saveTrades();
  renderTrades();
});

console.log("Trades loaded:", trades);

renderTrades();
