const REMOTE_GAMES_JSON = "https://raw.githubusercontent.com/swarmintelli/Unblocked-Games-CDN/main/games.json";

let games = [];
let activeCategory = "All";

const grid = document.getElementById("gameGrid");
const featuredGrid = document.getElementById("featuredGrid");
const categoriesEl = document.getElementById("categories");
const searchEl = document.getElementById("search");

function slugify(s = "") {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function extractSrc(iframeValue = "") {
  const match = iframeValue.match(/src\s*=\s*"([^"]+)"/i);
  return match ? match[1] : "";
}

function normalizeRemoteGame(item, idx) {
  const name = item.game_name || item.name || `Game ${idx + 1}`;
  const embedUrl = item.embed_url || extractSrc(item.iframe || "");
  return {
    slug: item.slug || slugify(name),
    name,
    category: item.category || "Games",
    featured: idx < 8,
    description: item.game_description || item.description || "Play in your browser.",
    url: embedUrl,
    thumbnail: item.game_image_icon || item.thumbnail || ""
  };
}

function gameCard(game) {
  const thumb = game.thumbnail
    ? `<img class="thumb" src="${game.thumbnail}" alt="${game.name}" loading="lazy" referrerpolicy="no-referrer" />`
    : "";

  return `
    <article class="card">
      ${thumb}
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
  const featured = games.filter(g => g.featured).slice(0, 8);
  featuredGrid.innerHTML = featured.map(gameCard).join("");
}

function renderGrid() {
  const list = filteredGames();
  if (!list.length) {
    grid.innerHTML = `<p class="note">No games found for this filter.</p>`;
    return;
  }
  grid.innerHTML = list.map(gameCard).join("");
}

async function loadGames() {
  try {
    const res = await fetch(REMOTE_GAMES_JSON, { cache: "no-store" });
    const data = await res.json();
    const arr = Array.isArray(data) ? data : (Array.isArray(data.games) ? data.games : []);
    games = arr.map(normalizeRemoteGame).filter(g => g.url);
  } catch (err) {
    grid.innerHTML = `<p class="note">Could not load game catalog from GitHub JSON.</p>`;
    featuredGrid.innerHTML = "";
    return;
  }

  renderFeatured();
  renderCategories();
  renderGrid();
}

searchEl.addEventListener("input", renderGrid);
loadGames();
