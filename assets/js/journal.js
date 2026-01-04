const form = document.getElementById("tradeForm");
const tradeList = document.getElementById("tradeList");

let trades = JSON.parse(localStorage.getItem("trades")) || [];

function saveTrades() {
  localStorage.setItem("trades", JSON.stringify(trades));
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

    <button data-index="${index}">Delete</button>
    <hr>
  `;

    tradeList.appendChild(div);
  });
}

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

  const trade = {
    pair: document.getElementById("pair").value,
    timeframe: document.getElementById("timeframe").value,
    bias: document.getElementById("bias").value,
    risk: document.getElementById("risk").value,
    result: document.getElementById("result").value,
    lesson: document.getElementById("lesson").value,
  };

  trades.unshift(trade);
  saveTrades();
  renderTrades();
  form.reset();
});

renderTrades();
