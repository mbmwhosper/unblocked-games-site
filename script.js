const GAME_SOURCES = [
  {
    name: "lunaar",
    priority: 2,
    url: "https://raw.githubusercontent.com/thedogecraft/lunaar.org/main/public/json/games.json"
  },
  {
    name: "swarmintelli",
    priority: 1,
    url: "https://raw.githubusercontent.com/swarmintelli/Unblocked-Games-CDN/main/games.json"
  }
];

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

function normalizeFromSwarm(item, idx, sourceName, priority) {
  const name = item.name || item.game_name || `Game ${idx + 1}`;
  const embedUrl = item.game_url || item.embed_url || extractSrc(item.iframe || "");
  return {
    slug: item.slug || item["game-id"] || slugify(name),
    name,
    category: item.category || "Games",
    featured: idx < 8,
    description: item.game_description || item.description || "Play in your browser.",
    url: embedUrl,
    thumbnail: item.game_image_icon || item.thumbnail || "",
    sourceName,
    priority
  };
}

function normalizeFromLunaar(item, idx, sourceName, priority) {
  const name = item.name || `Game ${idx + 1}`;
  return {
    slug: item.slug || slugify(name),
    name,
    category: item.category || "Games",
    featured: idx < 8 || item.new === true,
    description: item.description || "Play in your browser.",
    url: item.url || "",
    thumbnail: item.image || "",
    sourceName,
    priority
  };
}

function normalizeUnknown(item, idx, sourceName, priority) {
  const name = item.name || item.title || item.game_name || `Game ${idx + 1}`;
  return {
    slug: item.slug || item.id || item["game-id"] || slugify(name),
    name,
    category: item.category || "Games",
    featured: idx < 8,
    description: item.description || "Play in your browser.",
    url: item.url || item.game_url || item.embed_url || extractSrc(item.iframe || ""),
    thumbnail: item.image || item.game_image_icon || item.thumbnail || "",
    sourceName,
    priority
  };
}

function normalizeItem(item, idx, source) {
  if (source.name === "swarmintelli") return normalizeFromSwarm(item, idx, source.name, source.priority);
  if (source.name === "lunaar") return normalizeFromLunaar(item, idx, source.name, source.priority);
  return normalizeUnknown(item, idx, source.name, source.priority);
}

function isUsableUrl(url = "") {
  return /^https?:\/\//i.test(url);
}

function mergeSources(rows) {
  const map = new Map();

  for (const g of rows) {
    if (!g?.name || !g?.url || !isUsableUrl(g.url)) continue;

    const key = slugify(g.name);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, g);
      continue;
    }

    // Prefer higher-priority source as a proxy for "newer/better" versions.
    // If equal, prefer longer URL (often more specific path).
    if (g.priority > existing.priority || (g.priority === existing.priority && g.url.length > existing.url.length)) {
      map.set(key, g);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
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

async function loadFromSource(source) {
  const res = await fetch(source.url, { cache: "no-store" });
  const data = await res.json();
  const arr = Array.isArray(data) ? data : (Array.isArray(data.games) ? data.games : []);
  return arr.map((item, idx) => normalizeItem(item, idx, source));
}

async function loadGames() {
  try {
    const settled = await Promise.allSettled(GAME_SOURCES.map(loadFromSource));
    const collected = settled
      .filter(r => r.status === "fulfilled")
      .flatMap(r => r.value);

    games = mergeSources(collected);

    if (!games.length) throw new Error("No games loaded");
  } catch (err) {
    grid.innerHTML = `<p class="note">Could not load game catalog from GitHub sources.</p>`;
    featuredGrid.innerHTML = "";
    return;
  }

  renderFeatured();
  renderCategories();
  renderGrid();
}

searchEl.addEventListener("input", renderGrid);
loadGames();
