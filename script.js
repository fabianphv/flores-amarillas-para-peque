const scenes = ["intro", "garden", "choice", "letter-scene"];
const foundFlowers = new Set();

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
  setTimeout(() => showScene("letter-scene"), 700);
});

document.getElementById("final-surprise").addEventListener("click", () => {
  document.getElementById("finale").hidden = false;
  launchPetals(45);
  document.getElementById("replay-button").focus();
});

document.getElementById("replay-button").addEventListener("click", () => {
  document.getElementById("finale").hidden = true;
  showScene("intro");
});

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
