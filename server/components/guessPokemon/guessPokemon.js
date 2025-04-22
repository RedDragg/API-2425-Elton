  const allePokemons = window.pokemons;
  window.geradenPokemonIds = JSON.parse(localStorage.getItem("geradenPokemonIds")) || [];

  let revealedLetterIndexes = [];
  let wrongGuessCount = Number(localStorage.getItem("totalWrongGuesses")) || 0;
  let currentStreak = Number(localStorage.getItem("currentStreak")) || 0;
  let bestStreak = Number(localStorage.getItem("bestStreak")) || 0;
  let canPlayWrongSound = true;
  const wrongSound = new Audio("/public/audio/wrong.mp3");

  const guessInput = document.getElementById("guess-input");
  const feedback = document.getElementById("feedback");

  function updateGevangenTeller() {
    const totaalGevangen = geradenPokemonIds.length;
    const totalePokemons = allePokemons.length;

    const gevangenElements = document.querySelectorAll(".caught-count");
    const totaleElements = document.querySelectorAll(".total-count");
    const pokeball = document.querySelector(".pokeball.catch");

    gevangenElements.forEach(el => {
      el.textContent = totaalGevangen;
      el.classList.remove("animate");
      void el.offsetWidth;
      el.classList.add("animate");
    });

    totaleElements.forEach(el => {
      el.textContent = totalePokemons;
    });

    if (pokeball) {
      pokeball.classList.remove("spin-once");
      void pokeball.offsetWidth;
      pokeball.classList.add("spin-once");

      setTimeout(() => {
        pokeball.classList.remove("spin-once");
      }, 600);
    }
  }


  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function randomPokemon() {
    const unkownPokemons = allePokemons.filter((p) => !geradenPokemonIds.includes(p.id));
    console.log(unkownPokemons);
    if (unkownPokemons.length === 0) return null;
    return unkownPokemons[Math.floor(Math.random() * unkownPokemons.length)];
  }

  function updateGuessUI(pokemon) {
    console.log(pokemon.id, pokemon.name);
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
    updateFoutTeller();
    updateStreakUI();

    updatePokemonListImages();
    updatePokedexList();
    applyPokedexFilter();
    activatePokedexClicks();



    const guessForm = document.getElementById("guess-form");

    guessForm.addEventListener("submit", (e) => {
      e.preventDefault();
      document.getElementById("last-correct-container").style.display = "none";
      const guess = guessInput.value.trim().toLowerCase();

      if (guess === currentPokemon.name.toLowerCase()) {
        geradenPokemonIds.push(currentPokemon.id);

        localStorage.setItem("geradenPokemonIds", JSON.stringify(geradenPokemonIds));
        console.log("Guessed Pokémon IDs:", window.geradenPokemonIds);

        if (geradenPokemonIds.length >= totaltowin) {
          const winnerContainer = document.getElementById("winner-container");
          winnerContainer.style.display = "flex";
          feedback.textContent = `Je hebt ${totaltowin} Pokémon geraden! 🎉`;
          guessInput.disabled = true;
          document.getElementById("submit-guess").disabled = true;
          localStorage.setItem("allPokemonsGuessed", true);
        }

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

        localStorage.setItem(
          "geradenPokemonIds",
          JSON.stringify(geradenPokemonIds)
        );

        currentStreak++;
        localStorage.setItem("currentStreak", currentStreak);


        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
          localStorage.setItem("bestStreak", bestStreak);

          const bestEl = document.getElementById("best-streak");
          if (bestEl) {
            bestEl.classList.add("highlight-streak");
            setTimeout(() => bestEl.classList.remove("highlight-streak"), 1000);
          }
        }

        updateStreakUI();

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
        cry.volume = window.getVolume();
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

        console.log("Fetching for Pokémon ID:", currentPokemon.id);


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
          }).catch((err) => {
            console.error("Fout bij ophalen species data:", err.message);
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
          }).catch((err) => {
            console.error("Fout bij ophalen species data:", err.message);
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
        localStorage.setItem("totalWrongGuesses", wrongGuessCount);
        updateFoutTeller();
        console.log(`Totale fouten: ${wrongGuessCount} | Laatste gok: "${guess}"`);

        console.log(`Fout gemaakt! Huidige streak was: ${currentStreak}`);
        console.log(`🔥 Hoogste streak tot nu toe: ${bestStreak}`);

        currentStreak = 0;
        localStorage.setItem("currentStreak", 0);

        updateStreakUI(); // reset ook UI



        // Speel foutgeluid af

        wrongSound.volume =  window.getVolume();
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
  })

  function updateFoutTeller() {
    const wrongGuessCount = Number(localStorage.getItem("totalWrongGuesses")) || 0;

    document.querySelectorAll(".wrong-count").forEach((el) => {
      el.textContent = wrongGuessCount;
    });
  }


  function updateStreakUI() {
    document.querySelectorAll(".current-streak").forEach(el => {
      el.textContent = currentStreak;
    });

    document.querySelectorAll(".best-streak").forEach(el => {
      el.textContent = bestStreak;
    });

  }

  console.log(`🔥 Nieuwe streak: ${currentStreak}`);
