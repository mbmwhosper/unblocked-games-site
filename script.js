const MONKEY_CONFIG_JS = "https://cdn.jsdelivr.net/gh/MonkeyGG2/monkeygg2.github.io@main/js/config.js";
const MONKEY_BASE = "https://monkeygg2.github.io/games/";

let games = [];
let activeCategory = "All";

const grid = document.getElementById("gameGrid");
const featuredGrid = document.getElementById("featuredGrid");
const categoriesEl = document.getElementById("categories");
const searchEl = document.getElementById("search");

function slugify(s = "") {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function fromMonkeyConfig() {
  const cfg = window.json?.games || {};
  return Object.entries(cfg)
    .map(([name, meta], idx) => {
      const path = meta?.path || "";
      if (!path || path.startsWith("flash/")) return null;

      const categories = Array.isArray(meta?.categories) && meta.categories.length
        ? meta.categories
        : ["Games"];

      return {
        slug: slugify(name),
        name,
        category: categories[0],
        featured: idx < 12,
        description: `HTML5 • ${path}`,
        url: `${MONKEY_BASE}${path}`,
        thumbnail: ""
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function gameCard(game) {
  return `
    <article class="card">
      <h3>${game.name}</h3>
      <p>${game.category} • ${game.description}</p>
      <a class="play-link" href="/g/${game.slug}">Play</a>
    </article>
  `;
}

function renderCategories() {
  const categories = ["All", ...new Set(games.map(g => g.category))].sort((a, b) => a.localeCompare(b));
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
    const searchPass = !q || `${g.name} ${g.description} ${g.category}`.toLowerCase().includes(q);
    return categoryPass && searchPass;
  });
}

function renderFeatured() {
  const featured = games.filter(g => g.featured).slice(0, 12);
  featuredGrid.innerHTML = featured.map(gameCard).join("");
}

function renderGrid() {
  const list = filteredGames();
  if (!list.length) {
    grid.innerHTML = `<p class="note">No HTML5 games found.</p>`;
    return;
  }
  grid.innerHTML = list.map(gameCard).join("");
}

async function loadGames() {
  try {
    await loadScript(MONKEY_CONFIG_JS);
    games = fromMonkeyConfig();
    if (!games.length) throw new Error("No HTML5 games found");
  } catch {
    grid.innerHTML = `<p class="note">Could not load HTML5 game catalog.</p>`;
    featuredGrid.innerHTML = "";
    return;
  }

  renderFeatured();
  renderCategories();
  renderGrid();
}

searchEl.addEventListener("input", renderGrid);
loadGames();
