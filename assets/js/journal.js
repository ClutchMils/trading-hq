const form = document.getElementById("tradeForm");
const tradeList = document.getElementById("tradeList");

const totalTradesEl = document.getElementById("totalTrades");
const winRateEl = document.getElementById("winRate");
const avgREl = document.getElementById("avgR");
const expectancyEl = document.getElementById("expectancy");

const checklistData = JSON.parse(localStorage.getItem("lastChecklist"));

let trades = JSON.parse(localStorage.getItem("trades")) || [];

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

function renderTrades() {
  tradeList.innerHTML = "";

  trades.forEach((trade, index) => {
    const div = document.createElement("div");

    div.innerHTML = `
    <p><strong>Pair:</strong> ${trade.pair}</p>
    <p><strong>Timeframe:</strong> ${trade.timeframe}</p>
    <p><strong>Bias:</strong> ${trade.bias}</p>
    <p><strong>Risk:</strong> ${trade.risk}%</p>
    <p><strong>Result:</strong> ${trade.result}R</p>
    <p><strong>Lesson:</strong> ${trade.lesson}</p>

    <p>
      <strong>Checklist:</strong>
      ${
        trade.checklistPassed === true
          ? "✅ Passed"
          : trade.checklistPassed === false
          ? "❌ Failed"
          : "Not recorded"
      }
    </p>

  <p><strong>Checklist Notes:</strong> ${trade.checklistNotes}</p>
  <p><strong>Checklist Time:</strong> ${trade.checklistTime}</p>

    <button data-index="${index}">Delete</button>
    <hr>
  `;

    tradeList.appendChild(div);
  });
  calculateStats();
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

  const trade = {
    pair: document.getElementById("pair").value,
    timeframe: document.getElementById("timeframe").value,
    bias: document.getElementById("bias").value,
    risk: document.getElementById("risk").value,
    result: document.getElementById("result").value,
    lesson: document.getElementById("lesson").value,

    checklistPassed: checklistData ? checklistData.passed : null,
    checklistNotes: checklistData ? checklistData.notes : "",
    checklistTime: checklistData ? checklistData.time : "N/A",
  };

  trades.unshift(trade);
  saveTrades();
  renderTrades();
  form.reset();
});

renderTrades();
