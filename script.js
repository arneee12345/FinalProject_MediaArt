let score = 0;
let timeLeft = 60;
let interval;
let comboCount = 0;
let lastClickTime = 0;

const leaderboardData = [
  { name: "Player1", score: 101 },
  { name: "Player2", score: 89 },
  { name: "YOU", score: 0 },
  { name: "Player3", score: 75 }
];

window.addEventListener("DOMContentLoaded", () => {
  const scoreEl = document.getElementById("score");
  const timerEl = document.getElementById("timer");
  const button = document.getElementById("click-button");
  const list = document.getElementById("leaderboard-list");

  function renderLeaderboard() {
    const sorted = [...leaderboardData].sort((a, b) => b.score - a.score);
    list.innerHTML = "";
    sorted.forEach(player => {
      const li = document.createElement("li");
      li.textContent = `${player.name}: ${player.score}`;
      list.appendChild(li);
    });
  }

  function showPopup(text, positive = true) {
    const popup = document.createElement("div");
    popup.textContent = text;
    popup.style.position = "absolute";
    popup.style.left = Math.random() * 80 + 10 + "%";
    popup.style.top = Math.random() * 60 + 20 + "%";
    popup.style.fontWeight = "bold";
    popup.style.color = positive ? "green" : "red";
    popup.style.background = "#fff";
    popup.style.border = "1px solid #ccc";
    popup.style.padding = "5px 10px";
    popup.style.borderRadius = "6px";
    popup.style.zIndex = 1000;
    popup.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 1000);
  }

  button.addEventListener("click", () => {
    const now = Date.now();
    let pts = 1;

    if (now - lastClickTime < 1000) {
      comboCount++;
      pts += comboCount;
      showPopup(`🔥 Combo x${comboCount}! +${pts}`, true);
    } else {
      comboCount = 0;
      showPopup("+1", true);
    }

    lastClickTime = now;
    score += pts;
    scoreEl.textContent = score;
    leaderboardData.find(p => p.name === "YOU").score = score;
    renderLeaderboard();
  });

  interval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(interval);
      button.disabled = true;
      timerEl.textContent = "Time's up!";
    } else {
      timerEl.textContent = `Time left: ${timeLeft}s`;
    }
  }, 1000);

  renderLeaderboard();
});
