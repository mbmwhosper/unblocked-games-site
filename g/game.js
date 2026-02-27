const games = window.GAMES || [];

function getSlugFromUrl() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  // /g/<slug>
  if (pathParts[0] === "g" && pathParts[1]) return pathParts[1];

  // fallback for /g/?slug=<slug>
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || "";
}

const slug = getSlugFromUrl();
const game = games.find(g => g.slug === slug);

const gameName = document.getElementById("gameName");
const gameDescription = document.getElementById("gameDescription");
const frame = document.getElementById("gameFrame");
const openNewTab = document.getElementById("openNewTab");
const fullscreenBtn = document.getElementById("fullscreenBtn");

if (!game) {
  gameName.textContent = "Game not found";
  gameDescription.textContent = "The requested game slug does not exist in catalog.";
} else {
  document.title = `PlayPortal — ${game.name}`;
  gameName.textContent = game.name;
  gameDescription.textContent = `${game.category} • ${game.description}`;
  frame.src = game.url;
  openNewTab.disabled = false;
  fullscreenBtn.disabled = false;
}

openNewTab.addEventListener("click", () => {
  if (game) window.open(game.url, "_blank", "noopener,noreferrer");
});

fullscreenBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await frame.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
});
