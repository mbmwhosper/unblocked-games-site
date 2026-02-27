const games = [
  {
    name: "2048",
    category: "Puzzle",
    description: "Classic tile-merging puzzle",
    url: "https://play2048.co/"
  },
  {
    name: "Hextris",
    category: "Arcade",
    description: "Fast-paced hexagon stacking",
    url: "https://hextris.io/"
  },
  {
    name: "QWOP",
    category: "Funny",
    description: "Legendary physics running game",
    url: "https://www.foddy.net/Athletics.html"
  },
  {
    name: "A Dark Room",
    category: "Text",
    description: "Minimalist incremental adventure",
    url: "https://adarkroom.doublespeakgames.com/"
  },
  {
    name: "Cookie Clicker",
    category: "Idle",
    description: "Incremental classic",
    url: "https://orteil.dashnet.org/cookieclicker/"
  }
];

let activeCategory = "All";
let activeGame = null;

const grid = document.getElementById("gameGrid");
const categoriesEl = document.getElementById("categories");
const searchEl = document.getElementById("search");
const frame = document.getElementById("gameFrame");
const title = document.getElementById("playerTitle");
const openNewTab = document.getElementById("openNewTab");
const fullscreenBtn = document.getElementById("fullscreenBtn");

function renderCategories() {
  const categories = ["All", ...new Set(games.map(g => g.category))];
  categoriesEl.innerHTML = "";

  categories.forEach(cat => {
    const chip = document.createElement("button");
    chip.className = `chip ${cat === activeCategory ? "active" : ""}`;
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      activeCategory = cat;
      renderCategories();
      renderGrid();
    });
    categoriesEl.appendChild(chip);
  });
}

function filteredGames() {
  const q = searchEl.value.trim().toLowerCase();
  return games.filter(g => {
    const categoryPass = activeCategory === "All" || g.category === activeCategory;
    const searchPass = !q || g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
    return categoryPass && searchPass;
  });
}

function renderGrid() {
  const list = filteredGames();
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = `<p class="note">No games found for this filter.</p>`;
    return;
  }

  list.forEach(game => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h3>${game.name}</h3><p>${game.category} • ${game.description}</p>`;
    card.addEventListener("click", () => launchGame(game));
    grid.appendChild(card);
  });
}

function launchGame(game) {
  activeGame = game;
  title.textContent = `Player — ${game.name}`;
  frame.src = game.url;
  openNewTab.disabled = false;
  fullscreenBtn.disabled = false;
}

searchEl.addEventListener("input", renderGrid);

openNewTab.addEventListener("click", () => {
  if (activeGame) window.open(activeGame.url, "_blank", "noopener,noreferrer");
});

fullscreenBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await frame.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
});

renderCategories();
renderGrid();
