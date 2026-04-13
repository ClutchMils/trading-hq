// logic.js

export function calculateStats(trades) {
  const closedTrades = trades.filter(
    (trade) => trade.status === "closed" || trade.status === undefined,
  );

  const total = closedTrades.length;

  if (total === 0) {
    return {
      totalTrades: trades.length,
      winRate: "0%",
      avgR: 0,
      expectancy: 0,
      colors: {
        winRate: "neutral",
        avgR: "neutral",
        expectancy: "neutral",
      },
    };
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

  return {
    totalTrades: total,
    winRate: `${winRate.toFixed(1)}%`,
    avgR: avgR.toFixed(2),
    expectancy: expectancy.toFixed(2),
    colors: {
      winRate: getColor(winRate, 50),
      avgR: getColor(avgR, 0),
      expectancy: getColor(expectancy, 0),
    },
  };
}

function getColor(value, threshold = 0) {
  if (value > threshold) return "positive";
  if (value < threshold) return "negative";
  return "neutral";
}
