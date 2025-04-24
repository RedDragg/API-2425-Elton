document.addEventListener("DOMContentLoaded", () => {
  const usernameContainer = document.getElementById("username-container");
  const usernameInput = document.getElementById("username-input");
  const usernameForm = document.getElementById("username-form");
  const greeting = document.getElementById("greeting");

  // ❗ Stoppen als cruciale elementen ontbreken
  if (!usernameContainer || !usernameInput || !usernameForm || !greeting) return;

  const savedUsername = localStorage.getItem("pokemonUsername");
  const savedCharacter = localStorage.getItem("pokemonCharacter");

  if (savedUsername && savedCharacter) {
    greeting.textContent = `Welkom terug, ${savedUsername}!`;
    usernameInput.value = savedUsername;
    usernameContainer.style.display = "none";
    updatePlayerUI();
    setTimeout(() => {
      greeting.style.display = "none";
    }, 3000);
  }

  usernameForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = usernameInput.value.trim();
    const selectedCharacter = document.querySelector('input[name="character"]:checked');

    if (!name || !selectedCharacter) {
      greeting.textContent = "Vul je naam in en kies een personage!";
      return;
    }

    localStorage.setItem("pokemonUsername", name);
    localStorage.setItem("pokemonCharacter", selectedCharacter.value);
    localStorage.setItem("pokemonSavedAt", new Date().toISOString());

    updateAccountCreatedUI();
    updatePlayerUI();

    greeting.textContent = `Welkom, ${name}!`;

    setTimeout(() => {
      usernameContainer.style.display = "none";
      greeting.style.display = "none";
    }, 3000);
  });

  updatePlayerUI();
  updateAccountCreatedUI();
});

// 👤 Speler UI updaten met naam en karakter
function updatePlayerUI() {
  const name = localStorage.getItem("pokemonUsername");
  const character = localStorage.getItem("pokemonCharacter");
  if (!name || !character) return;

  document.querySelectorAll(".player-avatar").forEach((el) => {
    el.src = `/public/img/${character}.png`;
    el.alt = name;
  });

  document.querySelectorAll(".player-name").forEach((el) => {
    el.textContent = name;
  });
}

// 📅 Datum weergeven van accountaanmaak
function updateAccountCreatedUI() {
  const createdAt = localStorage.getItem("pokemonSavedAt");

  document.querySelectorAll(".account-created").forEach((el) => {
    if (!createdAt) {
      el.textContent = "Account is nog niet aangemaakt.";
      return;
    }

    const formatted = new Date(createdAt).toLocaleString("nl-NL", {
      dateStyle: "long",
      timeStyle: "short"
    });
    el.textContent = formatted;
  });
}
