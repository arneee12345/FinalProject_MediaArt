
let score = 0;
let timeLeft = 60;
let interval;

document.getElementById("click-button").addEventListener("click", () => {
  score += 1;
  document.getElementById("score").textContent = score;
});

interval = setInterval(() => {
  timeLeft--;
  document.getElementById("timer").textContent = `Time left: ${timeLeft}s`;
  if (timeLeft <= 0) clearInterval(interval);
}, 1000);
