
const videoPlayer = document.getElementById("pokemon-video");
const introScherm = document.querySelector(".intro-scherm");
const introLink = document.getElementById("intro-link");
introLink.style.pointerEvents = "none";
introLink.style.cursor = "default";



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

      introLink.style.pointerEvents = "auto";
      introLink.style.cursor = "pointer";
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

  audioElements.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });

  const navigateToIndex = () => {
    window.location.href = "/index";
  };

  // View Transition API beschikbaar?
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      return new Promise((resolve) => {
        // Wacht op fade-out animatie (optioneel)
        const intro = document.querySelector(".intro-scherm");
        intro.classList.add("fade-out");

        setTimeout(() => {
          resolve(); // Hierna verandert de page
        }, 500);
      });
    }).finished.then(navigateToIndex);
  } else {
    // Fallback
    window.location.href = "/index";
  }
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
