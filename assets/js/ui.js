// ui.js
import { calculateStats } from "./logic.js";

export function renderTrades(trades, tradeList, statsElements) {
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
      <div class="trade-header">
        <div>
          <strong>${trade.market}</strong>
          <span class="muted">${trade.timeframe} • ${trade.direction}</span>
        </div>

        <div class="trade-result ${trade.result > 0 ? "win" : "loss"}">
          ${trade.status === "open" ? "🟡 Open" : `${trade.result}R`}
        </div>
      </div>

      <div class="setups">
        <span class="tag">${trade.setup}</span>
      </div>

      <div class="trade-grid">
        <div><span class="label">Date</span><span>${trade.date ? new Date(trade.date).toLocaleDateString() : "N/A"}</span></div>
        <div><span class="label">Bias</span><span>${trade.bias || "-"}</span></div>
        <div><span class="label">Risk</span><span>${trade.risk}%</span></div>
      </div>

      ${trade.comments ? `<div class="trade-note">${trade.comments}</div>` : ""}

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

      <div class="trade-actions">
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </div>
    `;

    tradeList.appendChild(div);
  });

  // handle stats here
  const stats = calculateStats(trades);

  statsElements.total.textContent = stats.totalTrades;
  statsElements.winRate.textContent = stats.winRate;
  statsElements.avgR.textContent = stats.avgR;
  statsElements.expectancy.textContent = stats.expectancy;

  applyColor(statsElements.winRate, stats.colors.winRate);
  applyColor(statsElements.avgR, stats.colors.avgR);
  applyColor(statsElements.expectancy, stats.colors.expectancy);

  function applyColor(el, className) {
    el.classList.remove("positive", "negative", "neutral");
    el.classList.add(className);
  }
}

// console.log("calculateStats:", calculateStats);
