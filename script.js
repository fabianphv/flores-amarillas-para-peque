const scenes = ["intro", "garden", "choice", "bird-game", "letter-scene"];
const foundFlowers = new Set();
let birdScore = 0;
let birdAttempts = 0;
let birdActive = false;

function showScene(id) {
  scenes.forEach((sceneId) => {
    document.getElementById(sceneId).hidden = sceneId !== id;
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("enter-button").addEventListener("click", () => showScene("garden"));

document.querySelectorAll(".flower").forEach((flower, index) => {
  flower.addEventListener("click", () => {
    if (foundFlowers.has(index)) return;
    foundFlowers.add(index);
    flower.classList.add("found");
    document.querySelector("#message-toast p").textContent = flower.dataset.message;

    const total = foundFlowers.size;
    document.getElementById("progress-text").textContent = `${total} de 5`;
    document.getElementById("progress-bar").style.width = `${total * 20}%`;

    if (total === 5) {
      document.querySelector("#message-toast p").textContent = "Las encontraste todas. Cada flor ya lleva un pedacito de lo que siento por ti.";
      document.getElementById("continue-button").hidden = false;
      launchPetals(20);
    }
  });
});

document.getElementById("continue-button").addEventListener("click", () => showScene("choice"));

document.querySelectorAll(".decoy").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("choice-hint").textContent = button.dataset.decoy;
  });
});

document.querySelector(".choice-button.correct").addEventListener("click", () => {
  document.getElementById("choice-hint").textContent = "Sabía que lo encontrarías 💛";
  setTimeout(() => showScene("bird-game"), 700);
});

const bird = document.getElementById("naughty-bird");
const birdArea = document.getElementById("bird-game-area");
const funnyDodges = [
  "¡Casi! El sindicato de pajaritos rechazó tu solicitud.",
  "Pío, pío… demasiado lenta, humana.",
  "Ese intento cuesta tres semillas. No aceptamos devoluciones.",
  "Yo no fui. Fue el otro pajarito amarillo.",
  "La carta ahora está bajo protección emplumada."
];
const caughtMessages = [
  "¡Uno atrapado! Devolvió un pedacito a cambio de semillas.",
  "¡Bien! Confesó que la carta era demasiado romántica.",
  "Otro fragmento recuperado. El sospechoso exige un abogado.",
  "¡Ya casi! Intentó distraerte haciéndose el tierno.",
  "¡Carta recuperada! Los culpables dicen estar profundamente arrepentidos… más o menos."
];

document.getElementById("start-bird-game").addEventListener("click", () => {
  birdScore = 0;
  birdAttempts = 0;
  birdActive = true;
  document.getElementById("bird-score").textContent = "0";
  document.getElementById("bird-attempts").textContent = "0";
  document.getElementById("bird-ready").hidden = true;
  document.getElementById("open-letter").hidden = true;
  document.getElementById("bird-message").textContent = "¡Rápido! El ladrón todavía tiene la carta.";
  updateLetterPieces();
  moveBird();
  bird.hidden = false;
});

bird.addEventListener("click", () => {
  if (!birdActive) return;
  birdAttempts += 1;
  document.getElementById("bird-attempts").textContent = String(birdAttempts);

  const mustDodge = birdAttempts % 3 === 0 && birdScore < 4;
  if (mustDodge) {
    document.getElementById("bird-message").textContent = funnyDodges[(birdAttempts / 3 - 1) % funnyDodges.length];
    bird.classList.add("dodging");
    moveBird();
    setTimeout(() => bird.classList.remove("dodging"), 260);
    return;
  }

  birdScore += 1;
  document.getElementById("bird-score").textContent = String(birdScore);
  document.getElementById("bird-message").textContent = caughtMessages[birdScore - 1];
  updateLetterPieces();
  bird.classList.add("caught");

  if (birdScore === 5) {
    birdActive = false;
    launchPetals(28);
    setTimeout(() => {
      bird.hidden = true;
      bird.classList.remove("caught");
      document.getElementById("open-letter").hidden = false;
    }, 420);
    return;
  }

  setTimeout(() => {
    bird.classList.remove("caught");
    moveBird();
  }, 420);
});

function moveBird() {
  const padding = 12;
  const maxX = Math.max(padding, birdArea.clientWidth - bird.offsetWidth - padding);
  const maxY = Math.max(padding, birdArea.clientHeight - bird.offsetHeight - padding);
  bird.style.left = `${padding + Math.random() * (maxX - padding)}px`;
  bird.style.top = `${padding + Math.random() * (maxY - padding)}px`;
}

function updateLetterPieces() {
  document.querySelectorAll("#letter-pieces span").forEach((piece, index) => {
    const recovered = index < birdScore;
    piece.textContent = recovered ? "💛" : "□";
    piece.classList.toggle("recovered", recovered);
  });
}

document.getElementById("open-letter").addEventListener("click", () => showScene("letter-scene"));

document.getElementById("final-surprise").addEventListener("click", () => {
  document.getElementById("finale").hidden = false;
  launchPetals(45);
  document.getElementById("replay-button").focus();
});

document.getElementById("replay-button").addEventListener("click", () => {
  document.getElementById("finale").hidden = true;
  resetJourney();
  showScene("intro");
});

function resetJourney() {
  foundFlowers.clear();
  document.querySelectorAll(".flower").forEach((flower) => flower.classList.remove("found"));
  document.getElementById("progress-text").textContent = "0 de 5";
  document.getElementById("progress-bar").style.width = "0%";
  document.querySelector("#message-toast p").textContent = "Toca una flor que esté brillando…";
  document.getElementById("continue-button").hidden = true;
  document.getElementById("choice-hint").textContent = "Puedes probar todas las opciones.";
  document.getElementById("bird-ready").hidden = false;
  document.getElementById("naughty-bird").hidden = true;
  document.getElementById("open-letter").hidden = true;
  document.getElementById("bird-message").textContent = "Los sospechosos están fingiendo inocencia.";
  birdScore = 0;
  birdAttempts = 0;
  birdActive = false;
  document.getElementById("bird-score").textContent = "0";
  document.getElementById("bird-attempts").textContent = "0";
  updateLetterPieces();
}

function launchPetals(amount) {
  const symbols = ["🌼", "✦", "💛"];
  for (let i = 0; i < amount; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.textContent = symbols[i % symbols.length];
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.setProperty("--drift", `${(Math.random() - 0.5) * 260}px`);
    petal.style.animationDuration = `${4 + Math.random() * 4}s`;
    petal.style.animationDelay = `${Math.random() * 1.5}s`;
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 9500);
  }
}
