"use strict";

const heroVideo = document.querySelector("#hero-video");
const heroMotion = document.querySelector("#hero-motion");
let wantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let heroVisible = true;

function updateHero() {
  if (!wantsMotion || !heroVisible) {
    heroVideo.pause();
    return;
  }
  if (!heroVideo.hasAttribute("src")) heroVideo.src = heroVideo.dataset.src;
  heroVideo.play().catch(() => {});
}

function updateHeroLabel() {
  heroMotion.textContent = heroVideo.paused ? "Play background" : "Pause background";
}
heroVideo.addEventListener("play", updateHeroLabel);
heroVideo.addEventListener("pause", updateHeroLabel);
heroMotion.addEventListener("click", () => {
  wantsMotion = heroVideo.paused;
  updateHero();
});
new IntersectionObserver(([entry]) => {
  heroVisible = entry.isIntersecting;
  updateHero();
}).observe(document.querySelector(".hero"));

const exampleButtons = [...document.querySelectorAll(".example-tabs [data-input]")];
const exampleInput = document.querySelector("#example-input");
const exampleOutput = document.querySelector("#example-output");
const exampleAssetVersion = new URL(document.currentScript.src).search;
for (const button of exampleButtons) {
  button.addEventListener("click", () => {
    for (const choice of exampleButtons) choice.setAttribute("aria-pressed", String(choice === button));
    const { input, clip } = button.dataset;
    const keepPlaying = !exampleOutput.paused;
    exampleInput.src = `assets/${input}.webp${exampleAssetVersion}`;
    exampleInput.alt = `Input illustration: ${button.textContent}`;
    exampleOutput.poster = `assets/${clip}.webp`;
    exampleOutput.src = `assets/${clip}.mp4`;
    exampleOutput.setAttribute("aria-label", `DynaCartoon output: ${button.textContent}`);
    if (keepPlaying) exampleOutput.play().catch(() => {});
  });
}

const videos = [...document.querySelectorAll("video:not(#hero-video)")];
for (const video of videos) {
  video.addEventListener("play", () => {
    const sync = video.closest("[data-sync]");
    for (const other of videos) {
      if (video === other || (sync && sync === other.closest("[data-sync]"))) continue;
      if (!other.paused) other.pause();
    }
  });
}

for (const group of document.querySelectorAll("[data-sync]")) {
  const companions = [...group.querySelectorAll("video")];
  const control = group.querySelector("[data-play-together]");
  const active = () => companions.some((v) => !v.paused && !v.ended);
  const refreshLabel = () => { control.textContent = active() ? "Pause videos" : "Play together"; };
  control.addEventListener("click", () => {
    if (active()) {
      for (const video of companions) video.pause();
    } else {
      for (const video of companions) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    }
  });
  for (const video of companions) {
    for (const event of ["play", "pause", "ended"]) video.addEventListener(event, refreshLabel);
  }
}

const bibtex = document.querySelector("#bibtex");
const copyResult = document.querySelector("#copy-result");
document.querySelector("#copy-bib").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(bibtex.textContent.trim());
    copyResult.textContent = "Citation copied.";
  } catch {
    const range = document.createRange();
    range.selectNodeContents(bibtex);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyResult.textContent = "Citation selected. Use your keyboard to copy.";
  }
});
