import "./index.css";

const allPokemons = window.pokemons;
let guessedPokemonIds = JSON.parse(localStorage.getItem("guessedPokemonIds")) || [];
let revealedLetterIndexes = [];
let wrongGuessCount = 0;

const guessInput = document.getElementById("guess-input");
const guessBtn = document.getElementById("submit-guess");
const feedback = document.getElementById("feedback");

// Enter = submit guess
guessInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") guessBtn.click();
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRandomUnseenPokemon() {
  const unseen = allPokemons.filter((p) => !guessedPokemonIds.includes(p.id));
  if (unseen.length === 0) return null;
  return unseen[Math.floor(Math.random() * unseen.length)];
}

function updateGuessUI(pokemon) {
  const guessImg = document.getElementById("guess-img");
  guessImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
  guessImg.setAttribute("data-id", pokemon.id);
  guessImg.setAttribute("alt", `Raad de Pokémon`);
  document.getElementById("random-pokemon").classList.remove("visible");

  // Genereer verborgen letters
  const nameContainer = document.getElementById("pokemon-name");
  nameContainer.innerHTML = "";
  for (let i = 0; i < pokemon.name.length; i++) {
    const span = document.createElement("span");
    span.textContent = pokemon.name[i];
    span.classList.add("hidden-letter");
    span.setAttribute("data-index", i);
    nameContainer.appendChild(span);
  }

  revealedLetterIndexes = [];
  wrongGuessCount = 0;
}

function activatePokedexClicks() {
  document.querySelectorAll('.pokedex .pokedex-list .pokedexPokemons.guessed').forEach(listItem => {
    if (listItem.dataset.clickBound === 'true') return;

    listItem.addEventListener('click', () => {
      const id = Number(listItem.dataset.id);
      if (!guessedPokemonIds.includes(id)) return;

      document.querySelectorAll('.pokedexPokemons.active').forEach(item => {
        item.classList.remove('active');
      });

      listItem.classList.add('active');

      const previewImg = document.getElementById('pokedex-preview-img');
      previewImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
      previewImg.style.display = 'block';
      previewImg.alt = `Pokémon #${id}`;
    });

    listItem.dataset.clickBound = 'true';
  });
}

document.addEventListener("DOMContentLoaded", () => {
  let currentPokemon = getRandomUnseenPokemon();
  updateGuessUI(currentPokemon);

  guessBtn.addEventListener("click", () => {
    const guess = guessInput.value.trim().toLowerCase();

    if (guess === currentPokemon.name.toLowerCase()) {
      const guessImg = document.getElementById("guess-img");
      guessImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${currentPokemon.id}.gif`;
      document.getElementById("random-pokemon").classList.add("visible");

      const listItem = document.querySelector(`.pokemon-list .pokemon[data-id="${currentPokemon.id}"]`);
      if (listItem) {
        const img = listItem.querySelector("img");
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${currentPokemon.id}.gif`;
        listItem.classList.add("visible");
      }

      document.querySelectorAll("#pokemon-name span").forEach((span) => {
        span.classList.remove("hidden-letter");
      });

      guessedPokemonIds.push(currentPokemon.id);
      localStorage.setItem("guessedPokemonIds", JSON.stringify(guessedPokemonIds));

      const pokedexItem = document.querySelector(`.pokedex .pokedex-list .pokedexPokemons[data-id="${currentPokemon.id}"]`);
      if (pokedexItem) {
        const nameElement = pokedexItem.querySelector(".pokedex-name");
        if (nameElement) nameElement.textContent = capitalize(currentPokemon.name);
        pokedexItem.classList.add("guessed");
      }

      activatePokedexClicks();

      currentPokemon = getRandomUnseenPokemon();
      if (currentPokemon) {
        updateGuessUI(currentPokemon);
        feedback.textContent = "";
        guessInput.value = "";
      } else {
        feedback.textContent = "Je hebt alle Pokémon geraden! 🎉";
        guessInput.disabled = true;
        guessBtn.disabled = true;
      }
    } else {
      feedback.textContent = "Helaas, dat is niet de juiste naam!";
      wrongGuessCount++;

      const nameSpans = document.querySelectorAll("#pokemon-name span");
      const hiddenIndexes = Array.from(nameSpans)
        .map((span, index) => span.classList.contains("hidden-letter") ? index : null)
        .filter((index) => index !== null);

      if (hiddenIndexes.length > 0) {
        const randomIndex = hiddenIndexes[Math.floor(Math.random() * hiddenIndexes.length)];
        nameSpans[randomIndex].classList.remove("hidden-letter");
        revealedLetterIndexes.push(randomIndex);
      }

      setTimeout(() => {
        feedback.textContent = "";
      }, 2000);
    }
  });

  // Toon alle geraden Pokémon in lijst en pokedex
  guessedPokemonIds.forEach((id) => {
    const listItem = document.querySelector(`.pokemon-list .pokemon[data-id="${id}"]`);
    if (listItem) {
      const img = listItem.querySelector("img");
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
      listItem.classList.add("visible");
    }
  });

  document.querySelectorAll(".pokedex .pokedex-list .pokedexPokemons").forEach((listItem) => {
    const nameElement = listItem.querySelector(".pokedex-name");
    const id = Number(listItem.dataset.id);
    const pokemon = allPokemons.find((p) => p.id === id);

    if (!pokemon || !nameElement) return;

    if (guessedPokemonIds.includes(id)) {
      nameElement.textContent = capitalize(pokemon.name);
      listItem.classList.add("guessed");
    } else {
      nameElement.textContent = "-".repeat(pokemon.name.length);
      listItem.classList.remove("guessed");
    }
  });

  activatePokedexClicks();
});

document.getElementById("reset-game").addEventListener("click", () => {
  localStorage.removeItem("guessedPokemonIds");
  location.reload();
});
