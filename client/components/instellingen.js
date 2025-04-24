let backgroundAudio = null;
let isMusicPlaying = false;

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
  "/public/audio/music/s12.mp3",
];

document.addEventListener("DOMContentLoaded", () => {
  const musicToggleBtn = document.getElementById("music-toggle-btn");
  const nextSongBtn = document.getElementById("next-song-btn");
  const musicVolumeSlider = document.getElementById("music-volume-slider");
  const volumeSlider = document.getElementById("volume-slider");

  if (!musicToggleBtn || !nextSongBtn || !musicVolumeSlider) return;

  function playRandomMusicLoop(playlist) {
    if (!playlist || playlist.length === 0) return;

    const randomIndex = Math.floor(Math.random() * playlist.length);
    const selectedTrack = playlist[randomIndex];

    if (backgroundAudio) {
      backgroundAudio.pause();
      backgroundAudio = null;
    }

    backgroundAudio = new Audio(selectedTrack);
    backgroundAudio.volume = musicVolumeSlider.value / 100 || 0.4;

    backgroundAudio.play().then(() => {
      musicToggleBtn.textContent = "⏸";
      isMusicPlaying = true;
    }).catch((err) => {
      console.warn("Kon achtergrondmuziek niet afspelen:", err);
    });

    backgroundAudio.addEventListener("ended", () => {
      playRandomMusicLoop(playlist);
    });
  }

  musicToggleBtn.addEventListener("click", () => {
    if (!backgroundAudio) {
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
    if (!startAudio.length) return;

    if (backgroundAudio) {
      backgroundAudio.pause();
      backgroundAudio.removeAttribute("src");
      backgroundAudio.load();
    }

    let nextTrack;
    const currentSrc = backgroundAudio?.src || "";
    let attempts = 0;
    do {
      nextTrack = startAudio[Math.floor(Math.random() * startAudio.length)];
      attempts++;
    } while (startAudio.length > 1 && currentSrc.includes(nextTrack) && attempts < 10);

    backgroundAudio = new Audio(nextTrack);
    backgroundAudio.volume = musicVolumeSlider.value / 100 || 0.4;

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

  musicVolumeSlider.addEventListener("input", () => {
    const volume = musicVolumeSlider.value / 100;
    if (backgroundAudio) {
      backgroundAudio.volume = volume;
    }
  });

  if (volumeSlider) {
    volumeSlider.addEventListener("input", () => {
      const volume = volumeSlider.value / 100;
      if (window.wrongSound) window.wrongSound.volume = volume;
      if (window.currentCry) window.currentCry.volume = volume;
    });
  }



});
