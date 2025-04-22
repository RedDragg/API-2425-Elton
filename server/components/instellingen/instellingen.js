let backgroundAudio = null;
let isMusicPlaying = false;



const musicToggleBtn = document.getElementById("music-toggle-btn");
const nextSongBtn = document.getElementById("next-song-btn");

const startAudio = [
  "/public/audio/music/s1.mp3",
  "/public/audio/music/s2.mp3",
  "/public/audio/music/s3.mp3",
  "/public/audio/music/s4.mp3",
  "/public/audio/music/s5.mp3",
  "/public/audio/music/s6.mp3",
  "/public/audio/music/s7.mp3",
  "/public/audio/music/s8.mp3",
  "/public/audio/music/s9.mp3",
  "/public/audio/music/s10.mp3",
  "/public/audio/music/s11.mp3",
  "/public/audio/music/s12.mp3"];



  function playRandomMusicLoop(playlist) {
    if (!playlist || playlist.length === 0) return;

    const randomIndex = Math.floor(Math.random() * playlist.length);
    const selectedTrack = playlist[randomIndex];

    if (backgroundAudio) {
      backgroundAudio.pause();
      backgroundAudio = null;
    }

    backgroundAudio = new Audio(selectedTrack);
    backgroundAudio.volume = musicVolumeSlider ? musicVolumeSlider.value / 100 : 0.4;

    backgroundAudio.play().then(() => {
      if (musicToggleBtn) musicToggleBtn.textContent = "⏸";
      isMusicPlaying = true;
    }).catch((err) => {
      console.warn("Kon achtergrondmuziek niet afspelen:", err);
    });

    backgroundAudio.addEventListener("ended", () => {
      playRandomMusicLoop(playlist);
    });
  }



const musicVolumeSlider = document.getElementById("music-volume-slider");
const volumeSlider = document.getElementById("volume-slider");

if (volumeSlider) {
// Zorg dat cry ook live meebeweegt
volumeSlider.addEventListener("input", () => {
  const volume = getVolume();
  if (window.wrongSound) window.wrongSound.volume = volume;
  if (window.currentCry) window.currentCry.volume = volume;
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


musicToggleBtn.addEventListener("click", () => {
  if (!backgroundAudio) {
    // Eerste keer klikken start de muziek
    playRandomMusicLoop(startAudio);
    return;
  }

  if (backgroundAudio.paused) {
    backgroundAudio.play().then(() => {
      musicToggleBtn.textContent = "⏸";
      isMusicPlaying = true;
    }).catch((err) => {
      console.warn("Kon muziek niet afspelen:", err);
    });
  } else {
    backgroundAudio.pause();
    musicToggleBtn.textContent = "▶";
    isMusicPlaying = false;
  }
});



nextSongBtn.addEventListener("click", () => {
  if (!startAudio || startAudio.length === 0) return;

  // Stop huidige audio
  if (backgroundAudio) {
    backgroundAudio.pause();
    backgroundAudio.removeAttribute("src");
    backgroundAudio.load();
  }

  // Kies een ander liedje dan het huidige
  let nextTrack;
  let currentSrc = backgroundAudio?.src || "";
  let attempts = 0;
  do {
    nextTrack = startAudio[Math.floor(Math.random() * startAudio.length)];
    attempts++;
  } while (startAudio.length > 1 && currentSrc.includes(nextTrack) && attempts < 10);

  backgroundAudio = new Audio(nextTrack);
  backgroundAudio.volume = musicVolumeSlider ? musicVolumeSlider.value / 100 : 0.4;

  backgroundAudio.play().then(() => {
    musicToggleBtn.textContent = "⏸";
    isMusicPlaying = true;
  }).catch((err) => {
    console.warn("Kon volgende muziek niet afspelen:", err);
  });

  backgroundAudio.addEventListener("ended", () => {
    playRandomMusicLoop(startAudio);
  });
});

if (musicVolumeSlider) {
  musicVolumeSlider.addEventListener("input", () => {
    const volume = musicVolumeSlider.value / 100;
    if (backgroundAudio) {
      backgroundAudio.volume = volume;
    }
  });
}
