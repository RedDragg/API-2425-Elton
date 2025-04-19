import "./index.css";

let paginationEnabled = false;
let currentFilterMode = "all"; // 'all', 'guessed', 'unguessed'

const allePokemons = window.pokemons;
let geradenPokemonIds = JSON.parse(localStorage.getItem("geradenPokemonIds")) || [];

let revealedLetterIndexes = [];
let wrongGuessCount = 0;
let canPlayWrongSound = true;
const wrongSound = new Audio("/public/audio/wrong.mp3");

const guessInput = document.getElementById("guess-input");
const feedback = document.getElementById("feedback");

function updateGevangenTeller() {
  const totaalGevangen = geradenPokemonIds.length;
  const totalePokemons = allePokemons.length;

  const gevangenElement = document.getElementById("caught-count");
  const totaleElement = document.getElementById("total-count");
  const pokeball = document.querySelector(".pokeball.catch");

  if (gevangenElement && totaleElement) {
    gevangenElement.textContent = totaalGevangen;
    totaleElement.textContent = totalePokemons;

    // Pop-effect voor het getal
    gevangenElement.classList.remove("animate");
    void gevangenElement.offsetWidth; // Hiermee zorg je ervoor dat de animate-klasse opnieuw volledig wordt afgespeeld
    gevangenElement.classList.add("animate");

    // Laat Pokéball 360° draaien bij nieuwe vangst
    if (pokeball) {
      pokeball.classList.remove("spin-once");
      void pokeball.offsetWidth;
      pokeball.classList.add("spin-once");

      setTimeout(() => {
        pokeball.classList.remove("spin-once");
      }, 600); // gelijk aan de duur van rotate360 animatie dus .6s
    }
  }
}



function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function randomPokemon() {
  const unkownPokemons = allePokemons.filter((p) => !geradenPokemonIds.includes(p.id));
  if (unkownPokemons.length === 0) return null;
  return unkownPokemons[Math.floor(Math.random() * unkownPokemons.length)];
}

function updateGuessUI(pokemon) {
  const guessImg = document.getElementById("guess-img");
  guessImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
  guessImg.setAttribute("data-id", pokemon.id);
  guessImg.setAttribute("alt", pokemon.name);

  document.getElementById("random-pokemon").classList.remove("visible");

  const guessNameContainer = document.getElementById("pokemon-name");
  guessNameContainer.innerHTML = "";
  for (let i = 0; i < pokemon.name.length; i++) {
    const span = document.createElement("span");
    span.textContent = pokemon.name[i];
    span.classList.add("hidden-letter");
    span.setAttribute("data-index", i);
    guessNameContainer.appendChild(span);
  }

  revealedLetterIndexes = [];
  wrongGuessCount = 0;
}

function activatePokedexClicks() {
  document
    .querySelectorAll(".pokedex .pokedex-list .pokedexPokemons.guessed")
    .forEach((listItem) => {
      if (listItem.dataset.clickBound === "true") return;

      listItem.addEventListener("click", () => {
        const id = Number(listItem.dataset.id);
        if (!geradenPokemonIds.includes(id)) return;

        document.querySelectorAll(".pokedexPokemons.active").forEach((item) => {
          item.classList.remove("active");
        });

        listItem.classList.add("active");

        const previewImg = document.getElementById("pokedex-preview-img");
        previewImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
        previewImg.style.display = "block";
        previewImg.alt = `Pokémon #${id}`;
      });

      listItem.dataset.clickBound = "true";
    });
}

function updatePokedexList() {
  document
    .querySelectorAll(".pokedex .pokedex-list .pokedexPokemons")
    .forEach((listItem) => {
      const nameElement = listItem.querySelector(".pokedex-name");
      const id = Number(listItem.dataset.id);
      const pokemon = allePokemons.find((p) => p.id === id);

      if (!pokemon || !nameElement) return;

      if (geradenPokemonIds.includes(id)) {
        nameElement.textContent = `#${String(pokemon.id).padStart(
          3,
          "0"
        )} ${capitalize(pokemon.name)}`;
        listItem.classList.add("guessed");
      } else {
        nameElement.textContent = `#${String(pokemon.id).padStart(
          3,
          "0"
        )} ${"-".repeat(pokemon.name.length)}`;
        listItem.classList.remove("guessed");
      }
    });
}

function applyPokedexFilter() {
  const filterSelect = document.getElementById("pokedex-filter");
  const showOnlyGuessed = filterSelect.value === "guessed";
  document
    .querySelectorAll(".pokedex .pokedex-list .pokedexPokemons")
    .forEach((listItem) => {
      const id = Number(listItem.dataset.id);
      const shouldShow = !showOnlyGuessed || geradenPokemonIds.includes(id);
      listItem.style.display = shouldShow ? "" : "none";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  let currentPokemon = randomPokemon();

  const datalist = document.getElementById("pokemon-suggestions");

  guessInput.addEventListener("input", (e) => {
    const inputValue = e.target.value.toLowerCase();
    datalist.innerHTML = "";

    if (inputValue.length < 4) return;

    const matchingPokemons = allePokemons.filter(p =>
      !geradenPokemonIds.includes(p.id) &&
      p.name.toLowerCase().startsWith(inputValue)
    );

    matchingPokemons.forEach(pokemon => {
      const option = document.createElement("option");
      option.value = capitalize(pokemon.name);
      datalist.appendChild(option);
    });
  });



  updateGuessUI(currentPokemon);
  updateGevangenTeller();

  const guessForm = document.getElementById("guess-form");

  guessForm.addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("last-correct-container").style.display = "none";
    const guess = guessInput.value.trim().toLowerCase();

    if (guess === currentPokemon.name.toLowerCase()) {
      const guessImg = document.getElementById("guess-img");
      guessImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${currentPokemon.id}.gif`;
      document.getElementById("random-pokemon").classList.add("visible");

      const listItem = document.querySelector(
        `.pokemon-list .pokemon[data-id="${currentPokemon.id}"]`
      );
      if (listItem) {
        const img = listItem.querySelector("img");
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${currentPokemon.id}.gif`;
        listItem.classList.add("visible");
      }

      document.querySelectorAll("#pokemon-name span").forEach((span) => {
        span.classList.remove("hidden-letter");
      });

      geradenPokemonIds.push(currentPokemon.id);
      localStorage.setItem(
        "geradenPokemonIds",
        JSON.stringify(geradenPokemonIds)
      );

      updateGevangenTeller();

      const pokedexItem = document.querySelector(
        `.pokedex .pokedex-list .pokedexPokemons[data-id="${currentPokemon.id}"]`
      );
      if (pokedexItem) {
        const nameElement = pokedexItem.querySelector(".pokedex-name");
        if (nameElement)
          nameElement.textContent = `#${String(currentPokemon.id).padStart(
            3,
            "0"
          )} ${capitalize(currentPokemon.name)}`;
        pokedexItem.classList.add("guessed");
      }

      const cry = new Audio(
        `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${currentPokemon.id}.ogg`
      );
      cry.volume = 0.3;
      cry.play();

      const lastCorrectImg = document.getElementById("last-correct-img");
      const lastCorrectContainer = document.getElementById(
        "last-correct-container"
      );
      const lastCorrectName = document.getElementById("last-correct-name");

      lastCorrectName.textContent = `No${String(currentPokemon.id).padStart(
        3,
        "0"
      )} ${currentPokemon.name.toUpperCase()}`;


      lastCorrectImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${currentPokemon.id}.gif`;
      lastCorrectContainer.style.display = "flex";

      // Haal genus en 9e flavor text op uit de Pokémon species API
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${currentPokemon.id}`)
        .then((res) => res.json())
        .then((speciesData) => {
          // Genus ophalen
          const englishGenus = speciesData.genera.find(
            (g) => g.language.name === "en"
          );
          const genusText = englishGenus ? englishGenus.genus : "";
          const genusElement = document.getElementById("last-correct-genus");
          if (genusElement) {
            genusElement.textContent = genusText;
          }

          // 9e flavor text ophalen
          const englishFlavors = speciesData.flavor_text_entries.filter(
            (entry) => entry.language.name === "en"
          );

          const flavorElement = document.getElementById("last-correct-flavor");

          if (englishFlavors.length >= 9) {
            const flavorText = englishFlavors[8].flavor_text
              .replace(/\s+/g, " ")
              .replace(/[\f\n\r]/g, " ")
              .trim();
            flavorElement.textContent = `"${flavorText}"`;
          } else {
            flavorElement.textContent = "Geen flavor text beschikbaar.";
          }
        });

      // Haal height & weight op uit de Pokémon API
      fetch(`https://pokeapi.co/api/v2/pokemon/${currentPokemon.id}`)
        .then((res) => res.json())
        .then((pokemonData) => {
          const heightInInches = (pokemonData.height * 3.937).toFixed(1);
          const weightInLbs = (pokemonData.weight * 0.2205).toFixed(1);

          const heightInCm = (pokemonData.height / 10).toFixed(2); // decimeter → cm
          const weightInKg = (pokemonData.weight / 10).toFixed(1); // hectogram → kg

          document.getElementById(
            "last-correct-height"
          ).textContent = `${heightInInches}" inch.`;
          document.getElementById(
            "last-correct-weight"
          ).textContent = `${weightInLbs} lbs.`;

          document.getElementById(
            "last-correct-height-kg"
          ).textContent = `${heightInCm} M.`;
          document.getElementById(
            "last-correct-weight-kg"
          ).textContent = `${weightInKg} kg.`;
        });

      activatePokedexClicks();
      updatePokedexList();
      applyPokedexFilter();

      currentPokemon = randomPokemon();
      if (currentPokemon) {
        updateGuessUI(currentPokemon);
        feedback.textContent = "";
        guessInput.value = "";
      } else {
        feedback.textContent = "Je hebt alle Pokémon geraden! 🎉";
        guessInput.disabled = true;
        document.getElementById("submit-guess").disabled = true;
      }
    } else {
      feedback.textContent = "Helaas, dat is niet de juiste naam!";
      wrongGuessCount++;

      // Speel foutgeluid af

      wrongSound.volume = 0.5;
      if (canPlayWrongSound) {
        canPlayWrongSound = false;
        wrongSound.currentTime = 0;
        wrongSound.play().catch(err => {
          console.warn("Kon foutgeluid niet afspelen:", err);
        });

        setTimeout(() => {
          canPlayWrongSound = true;
        }, 700);
      }





      const nameSpans = document.querySelectorAll("#pokemon-name span");
      const hiddenIndexes = Array.from(nameSpans)
        .map((span, index) =>
          span.classList.contains("hidden-letter") ? index : null
        )
        .filter((index) => index !== null);

      if (hiddenIndexes.length > 0) {
        const randomIndex =
          hiddenIndexes[Math.floor(Math.random() * hiddenIndexes.length)];
        nameSpans[randomIndex].classList.remove("hidden-letter");
        revealedLetterIndexes.push(randomIndex);
      }

      setTimeout(() => {
        feedback.textContent = "";
      }, 1000);
    }
  });

  geradenPokemonIds.forEach((id) => {
    const listItem = document.querySelector(
      `.pokemon-list .pokemon[data-id="${id}"]`
    );
    if (listItem) {
      const img = listItem.querySelector("img");
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
      listItem.classList.add("visible");
    }
  });

  document
    .getElementById("pokedex-filter")
    .addEventListener("change", applyPokedexFilter);

  updatePokedexList();
  applyPokedexFilter();
  activatePokedexClicks();
});

document.getElementById("reset-game").addEventListener("click", () => {
  localStorage.removeItem("geradenPokemonIds");
  location.reload();
});


const localImagePaths = [
  '/public/img/Grassland_Habitat.png',
  '/public/img/Forest_Habitat.png',
  '/public/img/Cave_Habitat.png',
  '/public/img/Mountain_Habitat.png',
  '/public/img/Rare_Habitat.png',
  '/public/img/Rough-terrain_Habitat.png',
  '/public/img/Urban_Habitat.png',
  '/public/img/Waters-edge_Habitat.png',
]

const videoPlayer = document.getElementById("pokemon-video");
const introScherm = document.querySelector(".intro-scherm");

const introVideo = [
  "/public/videos/pokemonintro1.mp4",
  "/public/videos/pokemonintro2.mp4",
  "/public/videos/pokemonintro3.mp4"
];

const introAudio = [
  "/public/audio/introsound1.mp3",
  "/public/audio/introsound2.mp3"
];

const audioElements = introAudio.map((src) => {
  const audio = new Audio(src);
  audio.volume = 0.5;
  return audio;
});

let currentVideoIndex = 0;
let introStarted = false;
let skipReady = false;
let onFinalVideo = false;


// Start intro + audio
function startIntro() {
  if (introStarted) return;
  introStarted = true;

  const firstAudio = audioElements[0];
  const secondAudio = audioElements[1];

  videoPlayer.src = introVideo[0];
  videoPlayer.muted = false;
  videoPlayer.loop = false;

  videoPlayer.play().catch((err) => {
    console.error("Video kon niet starten:", err);
  });

  firstAudio.loop = false;
  firstAudio.currentTime = 0;
  firstAudio.play().then(() => {
    firstAudio.addEventListener("ended", () => {
      secondAudio.loop = false;
      secondAudio.currentTime = 0;
      secondAudio.play().catch((err) => {
        console.error("Audio 2 kon niet starten:", err);
      });

      secondAudio.addEventListener("ended", () => {
        secondAudio.pause();
        secondAudio.currentTime = 0;
      }, { once: true });
    });
  }).catch((err) => {
    console.error("Audio 1 kon niet starten:", err);
  });

  // skip de eerste video na 1.5 seconden
  skipReady = false;
  setTimeout(() => {
    skipReady = true;
  }, 1500);
}



// Skip naar video 2 en audio 2
function skipToSecondVideo() {
  if (!skipReady || currentVideoIndex !== 0) return;

  videoPlayer.pause();
  audioElements[0].pause();
  audioElements[0].currentTime = 0;

  currentVideoIndex = 1;
  videoPlayer.src = introVideo[currentVideoIndex];
  videoPlayer.play();

  // Forceer audio 2
  const secondAudio = audioElements[1];
  secondAudio.currentTime = 0;
  secondAudio.play();

  skipReady = false;
}


function playNextVideo() {
  currentVideoIndex++;

  if (currentVideoIndex < introVideo.length) {
    videoPlayer.src = introVideo[currentVideoIndex];
    videoPlayer.loop = currentVideoIndex === introVideo.length - 1;
    videoPlayer.play();

    if (currentVideoIndex === introVideo.length - 1) {
      onFinalVideo = true;
    }
  }
}


videoPlayer.addEventListener("ended", () => {
  playNextVideo();
});

// Klik op video of container
introScherm.addEventListener("click", () => {
  if (!introStarted) {
    startIntro();
  } else if (skipReady && currentVideoIndex === 0) {
    skipToSecondVideo();
  } else if (onFinalVideo) {
    endIntro();
  }
});



function endIntro() {
  if (!videoPlayer.paused) {
    videoPlayer.pause();
  }
  videoPlayer.src = "";

  audioElements.forEach((audio) => {
    if (!audio.paused) {
      audio.pause();
    }
    audio.currentTime = 0;
  });

  const intro = document.querySelector(".intro-scherm");
  intro.classList.add("fade-out");

  setTimeout(() => {
    intro.style.display = "none";
  }, 500);

  window.removeEventListener("keydown", handleIntroKeydown);
  onFinalVideo = false;

  // 🎵 Start random background music
  playRandomMusicLoop(startAudio);
}



function handleIntroKeydown(e) {
  if (e.code === "Space") {
    e.preventDefault();

    if (!introStarted) {
      startIntro();
    } else if (skipReady && currentVideoIndex === 0) {
      skipToSecondVideo();
    } else if (onFinalVideo) {
      endIntro();
    }
  }
}

window.addEventListener("keydown", handleIntroKeydown);

const startAudio = [
"/public/audio/music/s1.mp3",
"/public/audio/music/s2.mp3",
"/public/audio/music/s3.mp3",
"/public/audio/music/s4.mp3",
"/public/audio/music/s5.mp3",
"/public/audio/music/s6.mp3",
"/public/audio/music/s7.mp3",
"/public/audio/music/s8.mp3",
"/public/audio/music/s9.mp3"];

let backgroundAudio = null;

function playRandomMusicLoop(playlist) {
  if (!playlist || playlist.length === 0) return;

  const randomIndex = Math.floor(Math.random() * playlist.length);
  const selectedTrack = playlist[randomIndex];

  if (backgroundAudio) {
    backgroundAudio.pause();
    backgroundAudio = null;
  }

  backgroundAudio = new Audio(selectedTrack);

  // 🔊 Haal volume uit de slider (indien beschikbaar)
  const volumeValue = volumeSlider ? volumeSlider.value / 100 : 0.4;
  backgroundAudio.volume = volumeValue;

  backgroundAudio.play().catch((err) => {
    console.warn("Kon achtergrondmuziek niet afspelen:", err);
  });

  backgroundAudio.addEventListener("ended", () => {
    playRandomMusicLoop(playlist);
  });
}


const volumeSlider = document.getElementById("volume-slider");

if (volumeSlider) {
  volumeSlider.addEventListener("input", () => {
    const volume = volumeSlider.value / 100;
    if (backgroundAudio) {
      backgroundAudio.volume = volume;
    }
  });
}

const catchCounter = document.getElementById("catch-counter");
const pokemonList = document.querySelector(".pokemon-list-container");

if (catchCounter && pokemonList) {
  catchCounter.addEventListener("click", () => {
    pokemonList.classList.toggle("slide-in");

    // 🔁 Als de lijst opent, update de zichtbaarheid op basis van pagination
    if (pokemonList.classList.contains("slide-in")) {
      renderPage(currentPage); // zorgt dat de juiste layout wordt getoond
    }
  });
}

const closePkmnListBtn = document.getElementById("close-pokemon-list");

if (closePkmnListBtn && pokemonList) {
  closePkmnListBtn.addEventListener("click", () => {
    pokemonList.classList.remove("slide-in");
  });
}

// Sluiten met Escape-toets
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && pokemonList.classList.contains("slide-in")) {
    pokemonList.classList.remove("slide-in");
  }
});

const filterAllBtn = document.getElementById("filter-all");
const filterGuessedBtn = document.getElementById("filter-guessed");
const filterUnguessedBtn = document.getElementById("filter-unguessed");

function applyPokemonFilter(mode) {
  currentFilterMode = mode;
  currentPage = 1;
  renderPage(currentPage);
}


function setActiveFilter(btn) {
  [filterAllBtn, filterGuessedBtn, filterUnguessedBtn].forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

filterAllBtn.addEventListener("click", () => {
  applyPokemonFilter("all");
  setActiveFilter(filterAllBtn);
});

filterGuessedBtn.addEventListener("click", () => {
  applyPokemonFilter("guessed");
  setActiveFilter(filterGuessedBtn);
});

filterUnguessedBtn.addEventListener("click", () => {
  applyPokemonFilter("unguessed");
  setActiveFilter(filterUnguessedBtn);
});


const allPokemonItems = Array.from(document.querySelectorAll(".pokemon-list .pokemon"));
const pageIndicator = document.getElementById("page-indicator");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");

const ITEMS_PER_PAGE = 24;
let currentPage = 1;
let maxPage = Math.ceil(allPokemonItems.length / ITEMS_PER_PAGE);

function renderPage(page) {
  let visibleItems = allPokemonItems.filter(pokemon => {
    const id = Number(pokemon.dataset.id);
    const isGuessed = geradenPokemonIds.includes(id);

    if (currentFilterMode === "guessed") return isGuessed;
    if (currentFilterMode === "unguessed") return !isGuessed;
    return true; // all
  });

  maxPage = Math.ceil(visibleItems.length / ITEMS_PER_PAGE);

  if (!paginationEnabled) {
    allPokemonItems.forEach(p => p.style.display = "none");
    visibleItems.forEach(p => p.style.display = "");
    pageIndicator.textContent = "Alle Pokémon";
    prevPageBtn.style.display = "none";
    nextPageBtn.style.display = "none";
    return;
  }

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = page * ITEMS_PER_PAGE;

  allPokemonItems.forEach(p => p.style.display = "none");

  visibleItems.slice(startIndex, endIndex).forEach(p => {
    p.style.display = "";
  });

  pageIndicator.textContent = `${page} / ${maxPage}`;
  prevPageBtn.style.display = "inline-block";
  nextPageBtn.style.display = "inline-block";
  prevPageBtn.disabled = page === 1;
  nextPageBtn.disabled = page === maxPage;
}



prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < maxPage) {
    currentPage++;
    renderPage(currentPage);
  }
});
const togglePaginationBtn = document.getElementById("toggle-pagination");

togglePaginationBtn.addEventListener("click", () => {
  paginationEnabled = !paginationEnabled;
  localStorage.setItem("paginationEnabled", paginationEnabled); // ← 🔐 opslaan

  togglePaginationBtn.textContent = paginationEnabled
    ? "Toon alle Pokémon"
    : "Toon 24 per pagina";

  // 👇 Voeg deze code toe
  const container = document.querySelector(".pokemon-list-container");
  if (paginationEnabled) {
    container.classList.add("fixed-height");
  } else {
    container.classList.remove("fixed-height");
  }

  renderPage(currentPage);
});

document.getElementById("cheat-all").addEventListener("click", () => {
  // Voeg alle ID's toe aan geradenPokemonIds
  geradenPokemonIds = allePokemons.map(p => p.id);
  localStorage.setItem("geradenPokemonIds", JSON.stringify(geradenPokemonIds));

  // Update UI
  updateGevangenTeller();
  updatePokedexList();
  applyPokedexFilter();

  // Maak alle Pokémon zichtbaar in de lijst
  document.querySelectorAll(".pokemon-list .pokemon").forEach((item) => {
    const img = item.querySelector("img");
    const id = item.dataset.id;
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
    item.classList.add("visible");
  });

  // Disable het raden zelf (optioneel)
  guessInput.disabled = true;
  document.getElementById("submit-guess").disabled = true;

  feedback.textContent = "😎 Alle Pokémon zijn geraden!";
});

const usernameContainer = document.getElementById("username-container");
const usernameInput = document.getElementById("username-input");
const saveUsernameBtn = document.getElementById("save-username");
const greeting = document.getElementById("greeting");

// Laad naam als hij er al is
const savedUsername = localStorage.getItem("pokemonUsername");
if (savedUsername) {
  greeting.textContent = `Welkom terug, ${savedUsername}!`;
  usernameInput.value = savedUsername;
  usernameContainer.style.display = "none"; // verberg container als naam al is opgeslagen
}

saveUsernameBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    localStorage.setItem("pokemonUsername", name);
    greeting.textContent = `Welkom, ${name}!`;
    usernameContainer.style.display = "none";
    setTimeout(() => {
      greeting.style.display = "none";
    }, 3000);
  } else {
    greeting.textContent = "Voer een geldige naam in.";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const storedName = localStorage.getItem("pokemonUsername");
  if (storedName) {
    usernameContainer.style.display = "none";
    greeting.textContent = `Welkom terug, ${storedName}!`;
    setTimeout(() => {
      greeting.style.display = "none";
    }, 3000);
  }
});



const opgeslagenNaam = localStorage.getItem("pokemonUsername");
if (opgeslagenNaam) {
  console.log("Opgeslagen naam:", opgeslagenNaam);
} else {
  console.log("Geen naam opgeslagen in localStorage.");
}
