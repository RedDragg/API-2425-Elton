document.addEventListener("DOMContentLoaded", () => {
  const videoPlayer = document.getElementById("pokemon-video");
  const introScherm = document.querySelector(".intro-scherm");
  const introLink = document.getElementById("intro-link");

  if (!videoPlayer || !introScherm || !introLink) {
    console.warn("❗ Intro-elementen ontbreken.");
    return;
  }


  introLink.style.pointerEvents = "none";
  introLink.style.cursor = "default";
  introLink.style.display = "none";

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

  function startIntro() {
    if (introStarted) return;
    if (!videoPlayer || audioElements.length < 2) return;

    introStarted = true;

    introLink.style.display = "block";
    introLink.style.pointerEvents = "none";

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

    skipReady = false;
    setTimeout(() => {
      skipReady = true;
    }, 1500);
  }

  function skipToSecondVideo() {
    if (!skipReady || currentVideoIndex !== 0) return;
    if (!videoPlayer || audioElements.length < 2) return;

    videoPlayer.pause();
    audioElements[0].pause();
    audioElements[0].currentTime = 0;

    currentVideoIndex = 1;
    videoPlayer.src = introVideo[currentVideoIndex];
    videoPlayer.play();

    const secondAudio = audioElements[1];
    secondAudio.currentTime = 0;
    secondAudio.play();

    skipReady = false;
  }

  function playNextVideo() {
    if (!videoPlayer) return;

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

  function endIntro() {
    if (!videoPlayer) return;

    if (!videoPlayer.paused) {
      videoPlayer.pause();
    }

    audioElements.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    const navigateToIndex = () => {
      window.location.href = "/pokemon";
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        return new Promise((resolve) => {
          const intro = document.querySelector(".intro-scherm");
          if (!intro) return resolve();
          intro.classList.add("fade-out");

          setTimeout(() => {
            resolve();
          }, 500);
        });
      }).finished.then(navigateToIndex);
    } else {
      window.location.href = "/pokemon";
    }
  }

  introScherm.addEventListener("click", () => {
    if (!introStarted) {
      startIntro();
    } else if (skipReady && currentVideoIndex === 0) {
      skipToSecondVideo();
    } else if (onFinalVideo) {
      endIntro();
    }
  });

  videoPlayer.addEventListener("ended", () => {
    playNextVideo();
  });

  function handleIntroKeydown(e) {
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") return;

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
  });

