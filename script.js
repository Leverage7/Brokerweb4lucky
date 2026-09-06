/* ------------------------------------------------------------------ */
/* Sample data (all illustrative — no live feeds)                      */
/* ------------------------------------------------------------------ */

const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", price: 77851.0, change: -2.91, seed: 1 },
  { symbol: "ETH", name: "Ethereum", price: 2444.53, change: -2.53, seed: 2 },
  { symbol: "SOL", name: "Solana", price: 104.35, change: -4.16, seed: 3 },
  { symbol: "MRD", name: "Meridian Token", price: 18.42, change: 5.2, seed: 4 },
  { symbol: "XRP", name: "Ripple", price: 1.39, change: -4.0, seed: 5 },
  { symbol: "AAPL", name: "Apple Inc.", price: 231.44, change: 1.12, seed: 6 },
];

const ARTICLES = [
  { tag: "Markets", title: "Why range-bound weeks matter more than breakouts", excerpt: "A look at how consolidation periods shape the setups that follow, using this build's sample dataset as a walkthrough.", date: "Aug 26" },
  { tag: "Product", title: "Designing a dashboard around one number", excerpt: "Notes on why the portfolio panel leads with total value instead of a wall of metrics — and what got cut.", date: "Aug 24" },
  { tag: "Learning", title: "Reading a sparkline in under two seconds", excerpt: "Sparklines trade precision for speed. Here's the reasoning behind using them across the asset table.", date: "Aug 21" },
  { tag: "Markets", title: "Volatility clusters: what the sample data shows", excerpt: "The simulated price history in this demo is seeded, not fetched — here's how the wave function behind it works.", date: "Aug 18" },
  { tag: "Product", title: "Settings as a single source of truth", excerpt: "Every preference in this build lives in one screen and one state object, on purpose.", date: "Aug 15" },
  { tag: "Learning", title: "Building a ticker tape with pure CSS", excerpt: "The marquee up top runs on a duplicated track and a CSS keyframe — no animation library required.", date: "Aug 12" },
];

/* ------------------------------------------------------------------ */
/* Deterministic pseudo-random wave (for sparklines + history chart)   */
/* ------------------------------------------------------------------ */

function seededWave(seed, points, volatility) {
  const out = [];
  let v = 50;
  for (let i = 0; i < points; i++) {
    const n = Math.sin(seed * 12.9898 + i * 0.7) * 43758.5453;
    const rand = n - Math.floor(n);
    v += (rand - 0.5) * volatility;
    out.push(v);
  }
  return out;
}

function sparklineSVG(seed, positive, width = 108, height = 34) {
  const data = seededWave(seed, 20, 8);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const color = positive ? "#4FD1A5" : "#E8656B";
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" />
  </svg>`;
}

function fmtUSD(n, decimals = 2) {
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/* ------------------------------------------------------------------ */
/* Renderers                                                            */
/* ------------------------------------------------------------------ */

function renderTicker() {
  const row = [...ASSETS, ...ASSETS];
  document.getElementById("tickerTrack").innerHTML = row
    .map(
      (a) => `
      <span class="tickerItem">
        <span class="tickerSymbol">${a.symbol}</span>
        <span class="mono">$${fmtUSD(a.price)}</span>
        <span class="${a.change >= 0 ? "up" : "down"}">${a.change >= 0 ? "▲" : "▼"} ${Math.abs(a.change)}%</span>
      </span>`
    )
    .join("");
}

function renderLandingAssetTable() {
  const rows = ASSETS.map(
    (a) => `
    <div class="assetRow">
      <span class="assetName"><strong>${a.symbol}</strong><span class="dim">${a.name}</span></span>
      <span class="mono">$${fmtUSD(a.price)}</span>
      <span class="${a.change >= 0 ? "up" : "down"}">${a.change >= 0 ? "▲" : "▼"} ${Math.abs(a.change)}%</span>
      <span>${sparklineSVG(a.seed, a.change >= 0)}</span>
    </div>`
  ).join("");

  document.getElementById("landingAssetTable").innerHTML = `
    <div class="assetRow assetHead">
      <span>Asset</span><span>Price</span><span>24h</span><span>Trend</span>
    </div>
    ${rows}
  `;
}

function renderStatCards() {
  const holdings = getHoldings();
  const total = holdings.reduce((s, h) => s + h.value, 0);
  document.getElementById("statCards").innerHTML = `
    <div class="statCard">
      <span class="dim small">Portfolio value</span>
      <span class="statBig mono">$${Math.round(total).toLocaleString()}</span>
      <span class="up">▲ +2.14% today</span>
    </div>
    <div class="statCard">
      <span class="dim small">Open positions</span>
      <span class="statBig mono">${holdings.length}</span>
      <span class="dim small">Across ${holdings.length} assets</span>
    </div>
    <div class="statCard">
      <span class="dim small">Session P/L</span>
      <span class="statBig mono up">+$684.12</span>
      <span class="dim small">Illustrative, resets on reload</span>
    </div>
  `;
}

function getHoldings() {
  return [
    { ...ASSETS[0], qty: 0.42, value: 32697.42, alloc: 38 },
    { ...ASSETS[1], qty: 3.1, value: 7578.04, alloc: 18 },
    { ...ASSETS[3], qty: 210, value: 3868.2, alloc: 14 },
    { ...ASSETS[2], qty: 40, value: 4174.0, alloc: 12 },
    { ...ASSETS[5], qty: 25, value: 5786.0, alloc: 18 },
  ];
}

function renderHoldingsTable() {
  const holdings = getHoldings();
  const rows = holdings
    .map(
      (h) => `
    <div class="assetRow holdingsRow">
      <span class="assetName"><strong>${h.symbol}</strong><span class="dim">${h.name}</span></span>
      <span class="mono">${h.qty}</span>
      <span class="mono">$${Math.round(h.value).toLocaleString()}</span>
      <span>
        <div class="allocBar"><div class="allocFill" style="width:${h.alloc}%"></div></div>
        <span class="dim small">${h.alloc}%</span>
      </span>
      <span>${sparklineSVG(h.seed, h.change >= 0)}</span>
    </div>`
    )
    .join("");

  document.getElementById("holdingsTable").innerHTML = `
    <div class="assetRow assetHead holdingsRow">
      <span>Asset</span><span>Qty</span><span>Value</span><span>Alloc.</span><span>Trend</span>
    </div>
    ${rows}
  `;
}

function renderHistoryChart() {
  const wave = seededWave(9, 30, 6);
  let base = 10000;
  const values = wave.map((v) => {
    base += v * 4;
    return Math.max(base, 2000);
  });

  const width = 600, height = 220, padding = 10;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return [x, y];
  });

  const linePath = "M " + points.map((p) => p.join(",")).join(" L ");
  const areaPath =
    `M ${points[0][0]},${height} L ` +
    points.map((p) => p.join(",")).join(" L ") +
    ` L ${points[points.length - 1][0]},${height} Z`;

  document.getElementById("historyChart").innerHTML = `
    <defs>
      <linearGradient id="valFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#E8A33D" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#E8A33D" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path d="${areaPath}" fill="url(#valFill)" stroke="none" />
    <path d="${linePath}" fill="none" stroke="#E8A33D" stroke-width="2" />
  `;
}

function renderNews() {
  document.getElementById("newsGrid").innerHTML = ARTICLES.map(
    (a) => `
    <div class="newsCard">
      <span class="newsTag">${a.tag}</span>
      <h3>${a.title}</h3>
      <p>${a.excerpt}</p>
      <span class="dim small">${a.date}</span>
    </div>`
  ).join("");
}

/* ------------------------------------------------------------------ */
/* Navigation                                                           */
/* ------------------------------------------------------------------ */

function goto(page) {
  document.getElementById("page-landing").classList.toggle("hidden", page !== "landing");
  document.getElementById("page-login").classList.toggle("hidden", page !== "login");
  const isShellPage = ["dashboard", "news", "settings"].includes(page);
  document.getElementById("app-shell").classList.toggle("hidden", !isShellPage);

  if (isShellPage) {
    showShellPage(page);
  }
}

function showShellPage(page) {
  ["dashboard", "news", "settings"].forEach((p) => {
    document.getElementById(`page-${p}`).classList.toggle("hidden", p !== page);
  });
  document.querySelectorAll(".sideLink[data-page]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
  const titles = { dashboard: "Dashboard", news: "News", settings: "Settings" };
  document.getElementById("topbarTitle").textContent = titles[page];
  document.getElementById("sidebar").classList.remove("open");
}

/* ------------------------------------------------------------------ */
/* Init                                                                  */
/* ------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  // Render all data-driven sections once
  renderTicker();
  renderLandingAssetTable();
  renderStatCards();
  renderHoldingsTable();
  renderHistoryChart();
  renderNews();

  // data-goto navigation (nav buttons, CTAs, logout, back link)
  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", () => goto(el.dataset.goto));
  });

  // Sidebar page links
  document.querySelectorAll(".sideLink[data-page]").forEach((el) => {
    el.addEventListener("click", () => showShellPage(el.dataset.page));
  });

  // Mock login form — never sends or stores anything, just navigates
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    goto("dashboard");
  });

  // Password show/hide toggle
  const pwInput = document.getElementById("pwInput");
  const pwToggle = document.getElementById("pwToggle");
  pwToggle.addEventListener("click", () => {
    const isPw = pwInput.type === "password";
    pwInput.type = isPw ? "text" : "password";
    pwToggle.textContent = isPw ? "hide" : "show";
  });

  // Mobile sidebar menu toggle
  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

  // Settings: toggles
  document.querySelectorAll(".toggle[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => btn.classList.toggle("on"));
  });

  // Settings: theme segmented control (visual only, session state)
  document.querySelectorAll(".segControl button[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".segControl button[data-theme]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Start on the landing page
  goto("landing");
});
