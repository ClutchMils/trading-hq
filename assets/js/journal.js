const form = document.getElementById("tradeForm");
const tradeList = document.getElementById("tradeList");

let trades = JSON.parse(localStorage.getItem("trades")) || [];

const totalTradesEl = document.getElementById("totalTrades");
const winRateEl = document.getElementById("winRate");
const avgREl = document.getElementById("avgR");
const expectancyEl = document.getElementById("expectancy");

const checklistData = JSON.parse(localStorage.getItem("lastChecklist"));

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
    div.classList.add("trade-card");

    div.innerHTML = `

    <div class="setups">
  ${renderSetups(trade.setups)}
</div>

<div class="row">
  <span class="label">Date</span>
  <span>${trade.date ? new Date(trade.date).toLocaleDateString() : "N/A"}</span>
</div>

<div class="row">
  <span class="label">Pair</span>
  <span>${trade.pair}</span>
</div>

<div class="row">
  <span class="label">Timeframe</span>
  <span>${trade.timeframe}</span>
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

      <button data-index="${index}">Delete</button>
  


   `;

    tradeList.appendChild(div);
  });
  // calculateStats();
}

calculateStats();

tradeList.addEventListener("click", function (e) {
  if (e.target.tagName === "BUTTON") {
    const index = e.target.getAttribute("data-index");

    trades.splice(index, 1);
    saveTrades();
    renderTrades();
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
    pair: document.getElementById("pair").value,
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

  trades.unshift(trade);
  saveTrades();
  localStorage.removeItem("lastChecklist");
  renderTrades();
  tradeList.firstElementChild?.scrollIntoView({ behavior: "smooth" });
  form.reset();
});

console.log("Trades loaded:", trades);

renderTrades();
