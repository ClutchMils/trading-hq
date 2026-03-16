let trades = JSON.parse(localStorage.getItem("trades")) || [];
let editingIndex = null;

const form = document.getElementById("tradeForm");
const tradeList = document.getElementById("tradeList");
const totalTradesEl = document.getElementById("totalTrades");
const winRateEl = document.getElementById("winRate");
const avgREl = document.getElementById("avgR");
const expectancyEl = document.getElementById("expectancy");
const setupInputs = document.querySelectorAll('input[type="checkbox"]');

function getSelectedSetups() {
  const selected = [];

  setupInputs.forEach((input) => {
    if (input.checked) {
      selected.push(input.value);
    }
  });

  return selected;
}

function saveTrades() {
  localStorage.setItem("trades", JSON.stringify(trades));
}

function calculateStats() {
  const total = trades.length;

  if (total === 0) {
    totalTradesEl.textContent = 0;
    winRateEl.textContent = "0%";
    avgREl.textContent = 0;
    expectancyEl.textContent = 0;
    return;
  }

  let wins = 0;
  let totalR = 0;

  trades.forEach((trade) => {
    const r = Number(trade.result);
    totalR += r;
    if (r > 0) wins++;
  });

  const winRate = ((wins / total) * 100).toFixed(1);
  const avgR = (totalR / total).toFixed(2);
  const expectancy = avgR; // expectancy per trade in R

  totalTradesEl.textContent = total;
  winRateEl.textContent = `${winRate}%`;
  avgREl.textContent = avgR;
  expectancyEl.textContent = expectancy;
}

function renderSetups(setups = []) {
  if (setups.length === 0) {
    return `<span class="tag tag--empty">No setup tagged</span>`;
  }

  return setups.map((tag) => `<span class="tag">${tag}</span>`).join("");
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
    div.classList.add("card","trade-card");

    div.innerHTML = `

      <div class="setups">
        ${renderSetups(trade.setups)}
      </div>

      <div class="row">
        <span class="label">Date</span>
        <span>${trade.date ? new Date(trade.date).toLocaleDateString() : "N/A"}</span>
      </div>

      <div class="row">
        <span class="label">Market</span>
        <span>${trade.market}</span>
      </div>

      <div class="row">
        <span class="label">Timeframe</span>
        <span>${trade.timeframe}</span>
      </div>

      <div class="row">
        <span class="label">bias</span>
        <span>${trade.bias}</span>
      </div>

      <div class="row">
        <span class="label">Result</span>
        <span class="${trade.result > 0 ? "win" : "loss"}">${trade.result}R</span>
      </div>

      <div class="row">
        <span class="label">Risk: </span>
        <span> ${trade.risk}% </span>
      </div>

      <div class="row">
        <span class = "label"> Lesson: </span>
        <span>${trade.lesson} </span>
      </div>

      <div class="row">
        <span class = "label">
          Checklist:
        </span>
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

      <div class="row">
        <span class = "label">
          Checklist Notes:
        </span>
        <span>${trade.checklistNotes} </span>
      </div>
          
      <div class="row">
        <span class = "label">
          Checklist Time:
          </span>
          <span>${trade.checklistTime} </span>
      </div>

      <button class="edit-btn" data-index="${index}">Edit</button>
      <button class="delete-btn" data-index="${index}">Delete</button>
    
    `;

    tradeList.appendChild(div);
  });
  calculateStats();
}

function loadTradeIntoForm(index) {
  const trade = trades[index];

  editingIndex = index;

  document.getElementById("market").value = trade.market;
  document.getElementById("timeframe").value = trade.timeframe;
  document.getElementById("bias").value = trade.bias;
  document.getElementById("risk").value = trade.risk;
  document.getElementById("result").value = trade.result;
  document.getElementById("lesson").value = trade.lesson;

  setupInputs.forEach((input) => {
    input.checked = trade.setups.includes(input.value);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
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

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const checklistData = JSON.parse(localStorage.getItem("lastChecklist"));

  const setups = getSelectedSetups();

  if (setups.length === 0) {
    alert("Select at least one setup.");
    return;
  }

  const trade = {
    id: Date.now(),
    date: new Date().toISOString(),
    market: document.getElementById("market").value,
    timeframe: document.getElementById("timeframe").value,
    bias: document.getElementById("bias").value,
    risk: document.getElementById("risk").value,
    result: document.getElementById("result").value,
    lesson: document.getElementById("lesson").value,

    setups: setups,

    checklistPassed: checklistData ? checklistData.passed : null,
    checklistNotes: checklistData ? checklistData.notes : "",
    checklistTime: checklistData ? checklistData.time : "N/A",
  };

  console.log(trade.setups);

  // trades.unshift(trade);
  if (editingIndex !== null) {
    trades[editingIndex] = trade;
    editingIndex = null;
  } else {
    trades.unshift(trade);
  }

  saveTrades();
  localStorage.removeItem("lastChecklist");
  renderTrades();
  tradeList.firstElementChild?.scrollIntoView({ behavior: "smooth" });
  form.reset();
});

console.log("Trades loaded:", trades);

renderTrades();
