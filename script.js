const JSON_SOURCES = [
  {
    name: "lunaar",
    url: "https://raw.githubusercontent.com/thedogecraft/lunaar.org/main/public/json/games.json",
    priority: 3
  },
  {
    name: "swarmintelli",
    url: "https://raw.githubusercontent.com/swarmintelli/Unblocked-Games-CDN/main/games.json",
    priority: 2
  },
  {
    name: "55gms",
    url: "https://raw.githubusercontent.com/55gms/55GMS/main/static/assets/json/load/g.json",
    priority: 1
  }
];

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

function extractSrc(iframeValue = "") {
  const m = iframeValue.match(/src\s*=\s*"([^"]+)"/i);
  return m ? m[1] : "";
}

function isUsableHtml5Url(url = "") {
  if (!/^https?:\/\//i.test(url)) return false;
  if (/\.swf($|\?)/i.test(url)) return false;
  if (/\bflash\b/i.test(url)) return false;
  return true;
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
      return {
        slug: slugify(name),
        name,
        category: (meta?.categories && meta.categories[0]) || "Games",
        description: "HTML5",
        url: `${MONKEY_BASE}${path}`,
        thumbnail: "",
        featured: idx < 14,
        source: "monkeygg2",
        priority: 4
      };
    })
    .filter(Boolean);
}

function normalizeJsonItem(item, source, idx) {
  const name = item.name || item.game_name || item.title || `Game ${idx + 1}`;
  const url = item.url || item.game_url || item.embed_url || extractSrc(item.iframe || "");
  const thumbnail = item.image || item.game_image_icon || item.thumbnail || "";
  const category = item.category || "Games";

  return {
    slug: item.slug || item["game-id"] || slugify(name),
    name,
    category,
    description: item.description || item.game_description || "HTML5",
    url,
    thumbnail,
    featured: idx < 10,
    source: source.name,
    priority: source.priority
  };
}

function dedupeMerge(rows) {
  const byName = new Map();
  for (const g of rows) {
    if (!g?.name || !isUsableHtml5Url(g.url)) continue;
    const key = slugify(g.name);
    const cur = byName.get(key);
    if (!cur || g.priority > cur.priority || (g.priority === cur.priority && g.url.length > cur.url.length)) {
      byName.set(key, g);
    }
  }
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
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
  const featured = games.filter(g => g.featured).slice(0, 12);
  featuredGrid.innerHTML = featured.map(gameCard).join("");
}

function renderGrid() {
  const list = filteredGames();
  if (!list.length) {
    grid.innerHTML = `<p class="note">No games found.</p>`;
    return;
  }
  grid.innerHTML = list.map(gameCard).join("");
}

async function loadJsonSource(source) {
  const res = await fetch(source.url, { cache: "no-store" });
  const data = await res.json();
  const arr = Array.isArray(data) ? data : (Array.isArray(data.games) ? data.games : []);
  return arr.map((item, idx) => normalizeJsonItem(item, source, idx));
}

async function loadGames() {
  try {
    await loadScript(MONKEY_CONFIG_JS);
    const monkeyGames = fromMonkeyConfig();

    const settled = await Promise.allSettled(JSON_SOURCES.map(loadJsonSource));
    const jsonGames = settled.filter(r => r.status === "fulfilled").flatMap(r => r.value);

    games = dedupeMerge([...monkeyGames, ...jsonGames]);
    if (!games.length) throw new Error("No games loaded");
  } catch (err) {
    grid.innerHTML = `<p class="note">Could not load game catalogs.</p>`;
    featuredGrid.innerHTML = "";
    return;
  }

  renderFeatured();
  renderCategories();
  renderGrid();
}

searchEl.addEventListener("input", renderGrid);
loadGames();
