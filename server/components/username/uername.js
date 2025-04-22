const usernameContainer = document.getElementById("username-container");
const usernameInput = document.getElementById("username-input");
const usernameForm = document.getElementById("username-form");
const greeting = document.getElementById("greeting");

const savedUsername = localStorage.getItem("pokemonUsername");
const savedCharacter = localStorage.getItem("pokemonCharacter");

if (savedUsername && savedCharacter) {
  // Als er een opgeslagen gebruiker en karakter is
  greeting.textContent = `Welkom terug, ${savedUsername}!`;
  usernameInput.value = savedUsername;
  usernameContainer.style.display = "none"; // Verberg het formulier na het inloggen
  updatePlayerUI(); // Werk de UI bij met de opgeslagen naam en karakter
  setTimeout(() => {
    greeting.style.display = "none"; // Verberg de welkomstboodschap na 3 seconden
  }, 3000);
}

usernameForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = usernameInput.value.trim();
  const selectedCharacter = document.querySelector('input[name="character"]:checked');

  if (name && selectedCharacter) {
    localStorage.setItem("pokemonUsername", name);
    localStorage.setItem("pokemonCharacter", selectedCharacter.value);
    localStorage.setItem("pokemonSavedAt", new Date().toISOString()); // Sla de datum van account aanmaken op

    console.log("✅ Gebruiker opgeslagen:");
    console.log("Naam:", name);
    console.log("Character:", selectedCharacter.value);
    console.log("Opgeslagen op:", new Date().toLocaleString("nl-NL"));

    updateAccountCreatedUI(); // Werk de account weergave bij

    greeting.textContent = `Welkom, ${name}!`;
    setTimeout(() => {
      usernameContainer.style.display = "none";  // Verberg het formulier na 3 seconden
    }, 3000);  // 3000 milliseconden = 3 seconden

    updatePlayerUI(); // Werk de speler UI bij met naam en karakter

    setTimeout(() => {
      greeting.style.display = "none"; // Verberg de welkomstboodschap na 3 seconden
    }, 3000);
  } else {
    greeting.textContent = "Vul je naam in en kies een personage!";
  }
});

// Functie om de speler UI bij te werken met naam en karakter
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

// Functie om de account aangemaakt datum weer te geven
function updateAccountCreatedUI() {
  const createdAt = localStorage.getItem("pokemonSavedAt");

  document.querySelectorAll(".account-created").forEach((el) => {
    if (createdAt) {
      const formatted = new Date(createdAt).toLocaleString("nl-NL", {
        dateStyle: "long",
        timeStyle: "short"
      });
      el.textContent = formatted;
    } else {
      el.textContent = "Account is nog niet aangemaakt.";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updatePlayerUI(); // Zorg ervoor dat de UI wordt bijgewerkt zodra de pagina is geladen
  updateAccountCreatedUI(); // Werk de account aangemaakt datum bij bij het laden
});
