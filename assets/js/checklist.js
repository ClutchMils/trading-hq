const rules = document.querySelectorAll(".rule");
const result = document.getElementById("result");
const checkButton = document.getElementById("checkButton");

checkButton.addEventListener("click", () => {
  let allChecked = true;

  rules.forEach((rule) => {
    if (!rule.checked) {
      allChecked = false;
    }
  });

  if (allChecked) {
    result.textContent = "✅ Conditions met. Trade is allowed.";
    result.style.color = "#22c55e";
  } else {
    result.textContent = "❌ Conditions NOT met. Do NOT trade.";
    result.style.color = "#ef4444";
  }
});
