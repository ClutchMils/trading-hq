import { renderTrades } from "./ui.js";
import { trades, addTrade, deleteTrade, updateTrade } from "./data.js";

const form = document.querySelector("#tradeForm");
const tradeList = document.getElementById("tradeList");

const directionButtons = document.querySelectorAll(
  "#directionToggle .option-card",
);

const timeframeButtons = document.querySelectorAll(
  "#timeframeToggle .option-card",
);

const biasButtons = document.querySelectorAll("#biasToggle .option-card");

const statsElements = {
  total: document.getElementById("totalTrades"),
  winRate: document.getElementById("winRate"),
  avgR: document.getElementById("avgR"),
  expectancy: document.getElementById("expectancy"),
};

let selectedDirection = null;
let selectedTimeframe = null;
let selectedBias = null;
let editingIndex = null;

function init() {
  renderTrades(trades, tradeList, statsElements);
}
init();

function getSelectedSetup() {
  const selected = document.querySelector('input[name="setup"]:checked');
  return selected ? selected.value : null;
}

function getChecklist() {
  return Array.from(document.querySelectorAll(".checklist-rule:checked")).map(
    (input) => input.value,
  );
}

function buildTradeObject() {
  const setup = getSelectedSetup();
  const checklist = getChecklist();

  if (!setup) {
    alert("Select a setup.");
    return null;
  }

  if (!selectedBias) {
    alert("Select bias.");
    return null;
  }

  if (!selectedDirection) {
    alert("Select direction.");
    return null;
  }

  if (!selectedTimeframe) {
    alert("Select timeframe.");
    return null;
  }

  const market = document.getElementById("market").value;
  const risk = Number(document.getElementById("risk").value);

  // RESULT LOGIC (only on edit)
  let result = null;
  let status = "open";

  if (editingIndex !== null) {
    const resultInput = document.getElementById("result").value;

    result = resultInput === "" ? null : Number(resultInput);
    status = result !== null ? "closed" : "open";
  }

  return {
    id: Date.now(),
    date: new Date().toISOString(),
    market: market,
    bias: selectedBias,
    timeframe: selectedTimeframe,
    direction: selectedDirection,
    setup: setup,
    risk: risk,

    result: result,
    status: status,

    checklist: checklist,
    checklistPassed: checklist.length === 4,

    comments: document.getElementById("comments").value.trim(),
  };
}

function loadTradeIntoForm(index) {
  const trade = trades[index];

  editingIndex = index;

  document.getElementById("market").value = trade.market || "";
  document.getElementById("risk").value = trade.risk || "";
  document.getElementById("result").value = trade.result || "";
  document.getElementById("comments").value = trade.comments || "";
  document.getElementById("resultGroup").style.display = "block";

  selectedDirection = trade.direction;
  selectedTimeframe = trade.timeframe;
  selectedBias = trade.bias;

  // restore UI (buttons)
  document.querySelectorAll('input[name="setup"]').forEach((input) => {
    input.checked = input.value === trade.setup;
  });

  directionButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === trade.direction);
  });

  timeframeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === trade.timeframe);
  });

  biasButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === trade.bias);
  });

  const form = document.querySelector("#tradeForm");

  if (form) {
    form.classList.add("editing");
    form.scrollIntoView({ behavior: "smooth" });
  }
}

directionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedDirection = btn.dataset.value;

    directionButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    console.log("Direction:", selectedDirection);
  });
});

timeframeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedTimeframe = btn.dataset.value;

    timeframeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    console.log("Timeframe:", selectedTimeframe);
  });
});

biasButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedBias = btn.dataset.value;

    biasButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    console.log("Bias:", selectedBias);
  });
});

tradeList.addEventListener("click", (e) => {
  const index = Number(e.target.dataset.index);

  if (e.target.classList.contains("delete-btn")) {
    deleteTrade(index);
    renderTrades(trades, tradeList, statsElements);
  }

  if (e.target.classList.contains("edit-btn")) {
    loadTradeIntoForm(index);
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const trade = buildTradeObject();

  if (!trade) return; //stop if validation failed

  if (editingIndex !== null) {
    updateTrade(editingIndex, trade);
    editingIndex = null;
  } else {
    addTrade(trade);
  }

  form.reset();

  //reset toggles
  selectedDirection = null;
  selectedTimeframe = null;
  selectedBias = null;

  directionButtons.forEach((b) => b.classList.remove("active"));
  timeframeButtons.forEach((b) => b.classList.remove("active"));
  biasButtons.forEach((b) => b.classList.remove("active"));

  document.getElementById("resultGroup").style.display = "none";

  document.querySelectorAll(".checklist-rule").forEach((input) => {
    input.checked = false;
  });

  form.classList.remove("editing");
  renderTrades(trades, tradeList, statsElements);
});

renderTrades(trades, tradeList, statsElements);

console.log("Trades loaded:", trades);
