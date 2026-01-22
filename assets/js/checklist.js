const rules = document.querySelectorAll(".rule");
const result = document.getElementById("result");
const checkButton = document.getElementById("checkButton");
const notesInput = document.getElementById("notes");

checkButton.addEventListener("click", () => {
  let allChecked = true;

  rules.forEach((rule) => {
    if (!rule.checked) {
      allChecked = false;
    }
  });

  const checklistResult = {
    passed: allChecked,
    notes: notesInput.value,
    time: new Date().toLocaleString(),
  };

  localStorage.setItem("lastChecklist", JSON.stringify(checklistResult));

  if (allChecked) {
    result.textContent = "✅ Conditions met. Trade is allowed.";
    result.style.color = "#22c55e";
  } else {
    result.textContent = "❌ Conditions NOT met. Do NOT trade.";
    result.style.color = "#ef4444";
  }
});
