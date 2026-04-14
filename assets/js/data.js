// data.js

export let trades = JSON.parse(localStorage.getItem("trades")) || [];

// MIGRATION
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

export function saveTrades() {
  localStorage.setItem("trades", JSON.stringify(trades));
}

export function addTrade(trade) {
  trades.unshift(trade);
  saveTrades();
}

export function deleteTrade(index) {
  trades.splice(index, 1);
  saveTrades();
}

export function updateTrade(index, updatedTrade) {
  trades[index] = updatedTrade;
  saveTrades();
}
