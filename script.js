const scenes = ["intro", "garden", "choice", "bird-game", "letter-scene"];
const foundFlowers = new Set();
let birdRound = 1;
let birdScore = 0;
let carrierBird = 0;
let birdPositions = [18, 50, 82];
let waitingForBirdChoice = false;
let gameToken = 0;

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

const memoryBirds = [...document.querySelectorAll(".memory-bird")];
const birdStage = document.getElementById("bird-stage");
const birdMessagesWrong = [
  "¡Te engañaron! El culpable dice: “casi, humana… pío, pío”.",
  "Pajarito equivocado. El verdadero ladrón exige semillas ilimitadas.",
  "¡Era el otro! Estos sospechosos claramente trabajan en equipo.",
  "Fallaste, pero el sindicato de pajaritos autorizó otro intento."
];
const birdMessagesRight = [
  "¡Correcto! Recuperaste el primer pedacito.",
  "¡Muy bien! Ese pajarito confesó inmediatamente.",
  "¡Tres aciertos! Los sospechosos empiezan a ponerse nerviosos.",
  "¡Solo falta uno! El cabecilla está intentando parecer adorable.",
  "¡Los atrapaste! Prometieron no volver a robar cartas… hoy."
];

document.getElementById("start-bird-game").addEventListener("click", () => {
  resetBirdGame();
  document.getElementById("bird-ready").hidden = true;
  birdStage.hidden = false;
  startBirdRound();
});

async function startBirdRound() {
  const token = ++gameToken;
  waitingForBirdChoice = false;
  carrierBird = Math.floor(Math.random() * memoryBirds.length);
  birdPositions = [18, 50, 82];
  document.getElementById("bird-round").textContent = String(birdRound);
  document.getElementById("bird-message").textContent = "Mira el pajarito y recuerda también su pequeño distintivo…";
  memoryBirds.forEach((bird, index) => {
    bird.disabled = true;
    bird.className = `memory-bird bird-slot-${index}`;
    bird.style.left = `${birdPositions[index]}%`;
    bird.style.setProperty("--shuffle-speed", `${Math.max(.56, .86 - birdRound * .05)}s`);
  });

  memoryBirds[carrierBird].classList.add("revealing");
  await pause(Math.max(1350, 1950 - birdRound * 80));
  if (token !== gameToken) return;
  memoryBirds[carrierBird].classList.remove("revealing");
  document.getElementById("bird-message").textContent = "¡No le quites los ojos de encima!";

  const swaps = 2 + birdRound;
  for (let i = 0; i < swaps; i += 1) {
    let first = Math.floor(Math.random() * 3);
    let second = Math.floor(Math.random() * 3);
    while (second === first) second = Math.floor(Math.random() * 3);
    [birdPositions[first], birdPositions[second]] = [birdPositions[second], birdPositions[first]];
    memoryBirds.forEach((bird, index) => {
      bird.style.left = `${birdPositions[index]}%`;
    });
    await pause(Math.max(610, 970 - birdRound * 55));
    if (token !== gameToken) return;
  }

  waitingForBirdChoice = true;
  memoryBirds.forEach((bird) => {
    bird.disabled = false;
  });
  document.getElementById("bird-message").textContent = "¿Cuál pajarito tiene el fragmento? Toca al culpable.";
}

memoryBirds.forEach((bird) => {
  bird.addEventListener("click", () => chooseBird(Number(bird.dataset.bird)));
});

async function chooseBird(selectedBird) {
  if (!waitingForBirdChoice) return;
  waitingForBirdChoice = false;
  memoryBirds.forEach((bird) => {
    bird.disabled = true;
  });

  const selected = memoryBirds[selectedBird];
  const carrier = memoryBirds[carrierBird];
  carrier.classList.add("show-answer");

  if (selectedBird === carrierBird) {
    birdScore += 1;
    selected.classList.add("correct");
    document.getElementById("bird-score").textContent = String(birdScore);
    document.getElementById("bird-message").textContent = birdMessagesRight[birdScore - 1];
    updateLetterPieces();

    if (birdScore === 5) {
      launchPetals(30);
      await pause(850);
      birdStage.hidden = true;
      document.getElementById("open-letter").hidden = false;
      document.getElementById("bird-message").textContent = "Carta recuperada. Caso cerrado por exceso de ternura.";
      return;
    }

    birdRound += 1;
    await pause(1100);
  } else {
    selected.classList.add("wrong");
    document.getElementById("bird-message").textContent = birdMessagesWrong[Math.floor(Math.random() * birdMessagesWrong.length)];
    await pause(1350);
  }

  carrier.classList.remove("show-answer");
  selected.classList.remove("correct", "wrong");
  startBirdRound();
}

function updateLetterPieces() {
  document.querySelectorAll("#letter-pieces span").forEach((piece, index) => {
    const recovered = index < birdScore;
    piece.textContent = recovered ? "💛" : "□";
    piece.classList.toggle("recovered", recovered);
  });
}

function resetBirdGame() {
  gameToken += 1;
  birdRound = 1;
  birdScore = 0;
  waitingForBirdChoice = false;
  document.getElementById("bird-round").textContent = "1";
  document.getElementById("bird-score").textContent = "0";
  document.getElementById("bird-message").textContent = "Los sospechosos están intentando parecer inocentes.";
  document.getElementById("open-letter").hidden = true;
  memoryBirds.forEach((bird, index) => {
    bird.className = `memory-bird bird-slot-${index}`;
    bird.style.left = `${[18, 50, 82][index]}%`;
  });
  updateLetterPieces();
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
  birdStage.hidden = true;
  resetBirdGame();
}

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
