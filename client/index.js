  import "./index.css";
  import "./components/instellingen.js";
  import "./components/uername.js";
  import "./components/guessPokemon.js";
  import "./components/intro.js";

  document.addEventListener("DOMContentLoaded", () => {
    const pokedexFilterAllBtn = document.getElementById("pokedex-filter-all");
    const pokedexFilterGuessedBtn = document.getElementById("pokedex-filter-guessed");
    const filterAllBtn = document.getElementById("filter-all");
    const filterGuessedBtn = document.getElementById("filter-guessed");
    const filterUnguessedBtn = document.getElementById("filter-unguessed");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    const togglePaginationBtn = document.getElementById("toggle-pagination");
    const resetGameBtn = document.getElementById("reset-game");
    const usernameForm = document.getElementById("username-form");
    const feedback = document.getElementById("feedback");
    const pageIndicator = document.getElementById("page-indicator");
    const allePokemons = window.pokemons || [];


    if (
      !pokedexFilterAllBtn ||
      !pokedexFilterGuessedBtn ||
      !filterAllBtn ||
      !filterGuessedBtn ||
      !filterUnguessedBtn ||
      !prevPageBtn ||
      !nextPageBtn ||
      !togglePaginationBtn ||
      !resetGameBtn ||
      !usernameForm ||
      !feedback ||
      !pageIndicator
    ) {
      console.warn("❗ Een of meer benodigde elementen ontbreken.");
      return;
    }


  let paginationEnabled = false;
  let currentFilterMode = "all"; // 'all', 'guessed', 'unguessed'

  let totaltowin = 151;
  window.totaltowin = totaltowin;

  // function getSelectedGeneration() {
  //   const selectedRadio = document.querySelector('input[name="generation"]:checked');
  //   return selectedRadio ? selectedRadio.value : null; // Retourneer de value van de geselecteerde radio knop
  // }

  // document.querySelector('form').addEventListener('change', () => {
  //   totaltowin = getSelectedGeneration();
  //   console.log("Aantal Pokémon om te winnen:", totaltowin); // Laat het aantal Pokémon zien voor de geselecteerde generatie
  // });


  window.wrongSound = new Audio("/public/audio/wrong.mp3");
  const volumeSlider = document.getElementById("volume-slider");

  window.getVolume = function () {
    return volumeSlider ? volumeSlider.value / 100 : 0.4;
  };

  function activatePokedexClicks() {
    document
      .querySelectorAll(".pokedex .pokedex-list .pokedexPokemons.guessed")
      .forEach((listItem) => {
        if (listItem.dataset.clickBound === "true") return;

        listItem.addEventListener("click", () => {
          const id = Number(listItem.dataset.id);
          if (!window.geradenPokemonIds.includes(id)) return;

          document.querySelectorAll(".pokedexPokemons.active").forEach((item) => {
            item.classList.remove("active");
          });

          listItem.classList.add("active");

          const previewImg = document.getElementById("pokedex-preview-img");
          if (!previewImg) return;
          previewImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
          previewImg.style.display = "block";
          previewImg.alt = `Pokémon #${id}`;

          const cry = new Audio(
            `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
          );
          cry.volume = window.getVolume() / 2;
          cry.play().catch((err) => {
            console.warn("Cry kon niet afgespeeld worden:", err);
          });
        });

        listItem.dataset.clickBound = "true";
      });
  }


  function updatePokedexList() {
    const listItems = document.querySelectorAll(".pokedex .pokedex-list .pokedexPokemons");
    if (!listItems.length || !Array.isArray(window.geradenPokemonIds)) return;

    listItems.forEach((listItem) => {
      const nameElement = listItem.querySelector(".pokedex-name");
      const id = Number(listItem.dataset.id);
      const pokemon = allePokemons.find((p) => p.id === id);

      if (!pokemon || !nameElement) return;

      if (window.geradenPokemonIds.includes(id)) {
        nameElement.textContent = `#${String(pokemon.id).padStart(3, "0")} ${capitalize(pokemon.name)}`;
        listItem.classList.add("guessed");
      } else {
        nameElement.textContent = `#${String(pokemon.id).padStart(3, "0")} ${"-".repeat(pokemon.name.length)}`;
        listItem.classList.remove("guessed");
      }
    });
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }



  function updatePokemonListImages() {
    const listItems = document.querySelectorAll(".pokemon-list .pokemon");
    if (!listItems.length || !Array.isArray(window.geradenPokemonIds)) return;

    listItems.forEach((item) => {
      const id = Number(item.dataset.id);
      const img = item.querySelector("img");
      if (!img) return;

      if (window.geradenPokemonIds.includes(id)) {
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
        item.classList.add("visible");
      } else {
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        item.classList.remove("visible");
      }
    });
  }



  let currentPokedexFilter = "all";

  function applyPokedexFilter() {
    const items = document.querySelectorAll(".pokedex .pokedex-list .pokedexPokemons");
    if (!items.length) return;

    document.querySelectorAll(".pokedex .pokedex-list .pokedexPokemons").forEach((listItem) => {

      const id = Number(listItem.dataset.id);
      const isGuessed = window.geradenPokemonIds.includes(id);
      const shouldShow = currentPokedexFilter === "all" || isGuessed;

      listItem.style.display = shouldShow ? "" : "none";
    });
  }

  function setPokedexActiveButton(activeBtn) {
    [pokedexFilterAllBtn, pokedexFilterGuessedBtn].forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
  }

  pokedexFilterAllBtn.addEventListener("click", () => {
    currentPokedexFilter = "all";
    setPokedexActiveButton(pokedexFilterAllBtn);
    applyPokedexFilter();
  });

  pokedexFilterGuessedBtn.addEventListener("click", () => {
    currentPokedexFilter = "guessed";
    setPokedexActiveButton(pokedexFilterGuessedBtn);
    applyPokedexFilter();
  });

  document.getElementById("reset-game").addEventListener("click", () => {
    localStorage.clear();
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
  if (!allPokemonItems.length) return;


  const ITEMS_PER_PAGE = 24;
  let currentPage = 1;
  let maxPage = Math.ceil(allPokemonItems.length / ITEMS_PER_PAGE);

  function renderPage(page) {
    let visibleItems = allPokemonItems.filter(pokemon => {
      const id = Number(pokemon.dataset.id);
      const isGuessed = window.geradenPokemonIds.includes(id);

      if (currentFilterMode === "guessed") return isGuessed;
      if (currentFilterMode === "unguessed") return !isGuessed;
      return true;
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

  togglePaginationBtn.addEventListener("click", () => {
    paginationEnabled = !paginationEnabled;
    localStorage.setItem("paginationEnabled", paginationEnabled);

    togglePaginationBtn.textContent = paginationEnabled
      ? "Toon alle Pokémon"
      : "Toon 24 per pagina";


    const container = document.querySelector(".pokemon-list-container");
    if (paginationEnabled) {
      container.classList.add("fixed-height");
    } else {
      container.classList.remove("fixed-height");
    }

    renderPage(currentPage);
  });

  const cheatAllBtn = document.getElementById("cheat-all");
  if (cheatAllBtn) {
    cheatAllBtn.addEventListener("click", () => {
    window.geradenPokemonIds = allePokemons.map((p) => p.id);

    localStorage.setItem("geradenPokemonIds", JSON.stringify(window.geradenPokemonIds));

    const catchCount = window.geradenPokemonIds.length;
    localStorage.setItem("catchCount", catchCount);

    const totalCount = totaltowin;
    localStorage.setItem("totalCount", totalCount);

    updatePokedexList();
    updatePokemonListImages();
    applyPokedexFilter();
    updateGevangenTeller();
    activatePokedexClicks();

    document.querySelectorAll(".pokemon-list .pokemon").forEach((item) => {
      const img = item.querySelector("img");
      const id = item.dataset.id;
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
      item.classList.add("visible");
    });

    guessInput.disabled = true;
    document.getElementById("submit-guess").disabled = true;
    feedback.textContent = "😎 Alle Pokémon zijn geraden!";

    const winnerContainer = document.getElementById("winner-container");
    winnerContainer.style.display = "flex";

    localStorage.setItem("allPokemonsGuessed", true);
  });
  }



  function updateStreakUI() {
    const currentEls = document.querySelectorAll(".current-streak");
    const bestEls = document.querySelectorAll(".best-streak");
    if (!currentEls.length || !bestEls.length) return;


    document.querySelectorAll(".current-streak").forEach((el) => {
      el.textContent = currentStreak;
    });

      console.log("🔁 Streaks geladen uit localStorage:", { currentStreak, bestStreak });

    document.querySelectorAll(".best-streak").forEach((el) => {
      el.textContent = bestStreak;
    });

  }


    window.geradenPokemonIds = JSON.parse(localStorage.getItem("geradenPokemonIds")) || [];

    if (window.geradenPokemonIds.length >= totaltowin) {
      const winnerContainer = document.getElementById("winner-container");
      const submitGuessBtn = document.getElementById("submit-guess");

      if (!winnerContainer || !submitGuessBtn || !guessInput) return;
          if (winnerContainer) {
        winnerContainer.style.display = "flex";
        feedback.textContent = `Je hebt ${window.geradenPokemonIds.length} Pokémon geraden! 🎉`;
        guessInput.disabled = true;
        document.getElementById("submit-guess").disabled = true;
        localStorage.setItem("allPokemonsGuessed", true);
      }
    }

    // Update de pokédex en andere elementen
    updatePokedexList();
    updatePokemonListImages();
    activatePokedexClicks();







  function updateAccountCreatedUI() {
    const createdAt = localStorage.getItem("pokemonSavedAt");

    document.querySelectorAll(".account-created").forEach((el) => {
      if (createdAt) {
        const formatted = new Date(createdAt).toLocaleString("nl-NL", {
          dateStyle: "long",
          timeStyle: "short"
        });
        el.textContent = formatted;
      }
    });
  }

  function updateAllPlayerInfo() {
    const name = localStorage.getItem("pokemonUsername");
    const character = localStorage.getItem("pokemonCharacter");

    if (!name || !character) return;

    document.querySelectorAll(".player-avatar").forEach((avatarEl) => {
      avatarEl.src = `/public/img/${character}.png`;
      avatarEl.alt = name;
    });

    document.querySelectorAll(".player-name").forEach((nameEl) => {
      nameEl.textContent = name;
    });
  }


  // De submit event listener slechts eenmaal toevoegen
  document.getElementById('username-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Voorkom het standaard gedrag van het formulier

    // Verkrijg de geselecteerde generatie via de radio buttons
    const selectedGeneration = document.querySelector('input[name="generation"]:checked').value;

    let limit = 0;
    let offset = 0;
    totaltowin = 0;

    // Stel de juiste limit, offset en totaltowin in op basis van de geselecteerde generatie
    if (selectedGeneration === '151') {
      limit = 151;  // Gen 1: 151 Pokémon
      offset = 0;   // Start vanaf 0
      totaltowin = 151; // Voor Gen 1, set totaltowin naar 151
    } else if (selectedGeneration === '100') {
      limit = 100;  // Gen 2: 100 Pokémon
      offset = 151; // Start vanaf 151
      totaltowin = 100; // Voor Gen 2, set totaltowin naar 100
    } else if (selectedGeneration === '135') {
      limit = 135;  // Gen 3: 135 Pokémon
      offset = 251; // Start vanaf 251
      totaltowin = 135; // Voor Gen 3, set totaltowin naar 135
    }

    // Stuur de nieuwe instellingen naar de server
    fetch(`/update-settings?limit=${limit}&offset=${offset}&totaltowin=${totaltowin}`, {
      method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
      console.log('Nieuwe instellingen:', data);
      window.location.reload();  // Laad de pagina opnieuw met de nieuwe instellingen
    })
    .catch(error => console.error('Error bij het wijzigen van instellingen:', error));
  });

    // Haal de radio buttons op
    const generationRadios = document.querySelectorAll('input[name="generation"]');
    if (!generationRadios.length) return;

    // Voeg een event listener toe voor elke radio button
    generationRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        // Pas de waarde van totaltowin aan op basis van de geselecteerde radio button
        totaltowin = parseInt(this.value, 10);

        console.log(`Nieuwe waarde voor totaltowin: ${totaltowin}`);

        // Update de display voor hoeveel Pokémon de speler moet raden
      });
    });

    const catchCounter = document.getElementById("catch-counter");
    const pokemonList = document.querySelector(".pokemon-list-container");
    if (catchCounter && pokemonList) {
      catchCounter.addEventListener("click", () => {
        pokemonList.classList.toggle("slide-in");

        if (pokemonList.classList.contains("slide-in")) {
          renderPage(currentPage);
        }
      });
    }

  });
