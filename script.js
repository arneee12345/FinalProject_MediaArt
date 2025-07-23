let score = 0;
let timeLeft = 60;
let interval;

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

  button.addEventListener("click", () => {
    score += 1;
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
