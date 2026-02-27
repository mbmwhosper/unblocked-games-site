const LOCAL_GAMES_JSON = "/games.local.json";

let games = [];
let activeCategory = "All";

const grid = document.getElementById("gameGrid");
const featuredGrid = document.getElementById("featuredGrid");
const categoriesEl = document.getElementById("categories");
const searchEl = document.getElementById("search");

function slugify(s = "") {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalize(item, idx) {
  const name = item.name || `Game ${idx + 1}`;
  return {
    slug: item.slug || slugify(name),
    name,
    category: item.category || "Games",
    featured: Boolean(item.featured) || idx < 8,
    description: item.description || "Self-hosted HTML5 game.",
    url: item.url || "",
    thumbnail: item.thumbnail || ""
  };
}

function gameCard(game) {
  const thumb = game.thumbnail
    ? `<img class="thumb" src="${game.thumbnail}" alt="${game.name}" loading="lazy" />`
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
  const featured = games.filter(g => g.featured).slice(0, 12);
  featuredGrid.innerHTML = featured.map(gameCard).join("");
}

function renderGrid() {
  const list = filteredGames();
  if (!list.length) {
    grid.innerHTML = `<p class="note">No local games configured yet.</p>`;
    return;
  }
  grid.innerHTML = list.map(gameCard).join("");
}

async function loadGames() {
  try {
    const res = await fetch(LOCAL_GAMES_JSON, { cache: "no-store" });
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [];
    games = arr.map(normalize).filter(g => /^\/assets\/allgames\//.test(g.url));
    if (!games.length) throw new Error("No local games found");
  } catch {
    grid.innerHTML = `<p class="note">Could not load local catalog. Edit /games.local.json.</p>`;
    featuredGrid.innerHTML = "";
    return;
  }

  renderFeatured();
  renderCategories();
  renderGrid();
}

searchEl.addEventListener("input", renderGrid);
loadGames();
