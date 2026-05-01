const signals = [
  { id: 1, name: "Post-workout recovery gummies", market: "Fitness", source: "TikTok", score: 94, intent: 87, speed: "+48%", status: "hot", angle: "Creator routines focus on soreness, sleep quality and next-day energy." },
  { id: 2, name: "Pet hair air purifier filters", market: "Pets", source: "Search", score: 89, intent: 82, speed: "+36%", status: "hot", angle: "Searches cluster around allergies, odor and rental apartments." },
  { id: 3, name: "Heatless curl travel kits", market: "Beauty", source: "Meta", score: 86, intent: 78, speed: "+29%", status: "rising", angle: "Ads with before/after visuals hold attention above category average." },
  { id: 4, name: "Under-desk walking pads", market: "Home", source: "Amazon", score: 84, intent: 81, speed: "+25%", status: "rising", angle: "Buyer intent rises around compact storage and quiet motors." },
  { id: 5, name: "AI product photo backgrounds", market: "Tech", source: "Meta", score: 80, intent: 74, speed: "+21%", status: "rising", angle: "Small stores want faster ad creative without studio shoots." },
  { id: 6, name: "Mineral SPF serum sticks", market: "Beauty", source: "TikTok", score: 78, intent: 73, speed: "+18%", status: "rising", angle: "Portable skincare is trending with travel and gym bag content." },
  { id: 7, name: "Cordless fabric shavers", market: "Home", source: "Search", score: 75, intent: 69, speed: "+14%", status: "rising", angle: "Low-ticket problem solving product with strong visual proof." },
  { id: 8, name: "Dog enrichment freezer trays", market: "Pets", source: "TikTok", score: 72, intent: 66, speed: "+12%", status: "rising", angle: "Owners respond to calming routines and recipe-led content." }
];

history.scrollRestoration = "manual";

const ads = [
  { brand: "FlexFuel", hook: "Sore legs tomorrow? Not if this is in your routine.", spend: "High", format: "UGC demo", lift: "+31%" },
  { brand: "PawPure", hook: "The apartment smell fix pet owners keep reordering.", spend: "Rising", format: "Problem/solution", lift: "+24%" },
  { brand: "GlowLoop", hook: "Salon curls without heat damage in 8 minutes.", spend: "High", format: "Before/after", lift: "+28%" },
  { brand: "DeskStep", hook: "10k steps while clearing your inbox.", spend: "Stable", format: "Founder demo", lift: "+19%" },
  { brand: "Backdroply", hook: "Turn one product photo into a full ad set.", spend: "Rising", format: "Screen capture", lift: "+22%" },
  { brand: "SunSnap", hook: "SPF that fits next to your keys.", spend: "Testing", format: "Routine stack", lift: "+16%" }
];

const chartRanges = {
  7: [42, 54, 49, 68, 74, 82, 88, 94],
  30: [36, 48, 55, 62, 69, 73, 80, 87],
  90: [28, 36, 44, 50, 59, 66, 74, 82]
};

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Now"];
const titles = {
  dashboard: "Command center",
  signals: "Signal explorer",
  ads: "Ad library",
  analyst: "AI analyst",
  billing: "Plans and billing"
};

let saved = JSON.parse(localStorage.getItem("signalpilot_saved") || "[]");
let leads = JSON.parse(localStorage.getItem("signalpilot_leads") || "[]");

const routes = document.querySelectorAll("[data-route]");
const views = document.querySelectorAll(".view");
const viewTitle = document.querySelector("#viewTitle");
const globalSearch = document.querySelector("#globalSearch");
const marketFilter = document.querySelector("#marketFilter");
const sourceFilter = document.querySelector("#sourceFilter");
const scoreFilter = document.querySelector("#scoreFilter");
const scoreOutput = document.querySelector("#scoreOutput");

function setRoute(route) {
  views.forEach((view) => view.classList.toggle("active", view.id === route));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.route === route));
  viewTitle.textContent = titles[route] || titles.dashboard;
  history.replaceState(null, "", `#${route}`);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function matchesSearch(item) {
  const query = globalSearch.value.trim().toLowerCase();
  if (!query) return true;
  return Object.values(item).join(" ").toLowerCase().includes(query);
}

function getFilteredSignals() {
  const market = marketFilter.value;
  const source = sourceFilter.value;
  const minimum = Number(scoreFilter.value);
  return signals.filter((signal) => {
    return matchesSearch(signal)
      && (market === "all" || signal.market === market)
      && (source === "all" || signal.source === source)
      && signal.score >= minimum;
  });
}

function renderChart(range = "7") {
  const chart = document.querySelector("#forecastChart");
  chart.innerHTML = "";
  chartRanges[range].forEach((value, index) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${value}%`;
    bar.dataset.label = labels[index];
    bar.title = `${labels[index]}: ${value}`;
    chart.appendChild(bar);
  });
  document.querySelector("#opportunityScore").textContent = Math.round(chartRanges[range].at(-1) - 7);
}

function signalCard(signal) {
  const isSaved = saved.includes(signal.id);
  return `
    <article class="signal-card">
      <div>
        <h3>${signal.name}</h3>
        <p>${signal.angle}</p>
        <div class="meta-row">
          <span class="tag">${signal.market}</span>
          <span class="tag">${signal.source}</span>
          <span class="tag">Intent ${signal.intent}%</span>
          <span class="status-pill ${signal.status}">${signal.speed}</span>
        </div>
      </div>
      <span class="score-badge">${signal.score}</span>
      <button class="save-button ${isSaved ? "saved" : ""}" type="button" data-save="${signal.id}">
        ${isSaved ? "Saved" : "Save signal"}
      </button>
    </article>
  `;
}

function renderSignals() {
  const filtered = getFilteredSignals();
  document.querySelector("#signalGrid").innerHTML = filtered.length
    ? filtered.map(signalCard).join("")
    : '<div class="watch-empty">No signals match the current filters.</div>';
  renderOpportunityTable(filtered.slice(0, 5));
  bindSaveButtons();
}

function renderOpportunityTable(rows = signals.slice(0, 5)) {
  document.querySelector("#opportunityTable").innerHTML = `
    <div class="table-row header"><span>Opportunity</span><span>Market</span><span>Source</span><span>Score</span></div>
    ${rows.map((signal) => `
      <div class="table-row">
        <strong>${signal.name}</strong>
        <span>${signal.market}</span>
        <span>${signal.source}</span>
        <span class="status-pill ${signal.status}">${signal.score}</span>
      </div>
    `).join("")}
  `;
}

function renderWatchlist() {
  const savedSignals = signals.filter((signal) => saved.includes(signal.id));
  document.querySelector("#savedCount").textContent = saved.length;
  document.querySelector("#watchlist").innerHTML = savedSignals.length
    ? savedSignals.slice(0, 3).map(signalCard).join("")
    : '<div class="watch-empty">Save signals to build this week’s launch shortlist.</div>';
  bindSaveButtons();
}

function bindSaveButtons() {
  document.querySelectorAll("[data-save]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.save);
      saved = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
      localStorage.setItem("signalpilot_saved", JSON.stringify(saved));
      renderSignals();
      renderWatchlist();
    });
  });
}

function renderAds() {
  document.querySelector("#adGrid").innerHTML = ads
    .filter(matchesSearch)
    .map((ad) => `
      <article class="ad-card">
        <div class="ad-creative"></div>
        <div class="ad-body">
          <h3>${ad.brand}</h3>
          <p>${ad.hook}</p>
          <div class="meta-row">
            <span class="tag">${ad.format}</span>
            <span class="tag">${ad.spend}</span>
            <span class="status-pill hot">${ad.lift}</span>
          </div>
        </div>
      </article>
    `).join("");
}

function renderBrief() {
  document.querySelector("#creativeBrief").innerHTML = `
    <ul class="brief-list">
      <li>Lead with a visible transformation in the first two seconds.</li>
      <li>Use routine-based hooks for repeat-purchase categories.</li>
      <li>Show the product in a real room, gym bag or bathroom counter.</li>
      <li>Test one founder-demo angle against one creator POV angle.</li>
    </ul>
  `;
}

function renderAnalyst(prompt = "Find a product angle for recovery and sleep buyers") {
  document.querySelector("#chatLog").innerHTML = `
    <div class="chat-message user">${prompt}</div>
    <div class="chat-message ai">Recovery gummies are the strongest near-term angle. Demand is moving through creator routines, buyer intent is high, and ad saturation is still moderate outside the biggest brands.</div>
  `;
  document.querySelector("#launchPlan").innerHTML = `
    <li>Position the offer around next-day energy instead of generic recovery.</li>
    <li>Bundle a 30-day supply with a sleep-tracking challenge.</li>
    <li>Launch three UGC concepts: gym bag routine, bedtime stack and soreness myth-busting.</li>
    <li>Retarget viewers with a comparison page against magnesium capsules.</li>
  `;
}

function updateLeadSummary() {
  document.querySelector("#leadSummary").textContent = leads.length
    ? `${leads.length} saved request${leads.length === 1 ? "" : "s"} in this browser.`
    : "No requests yet.";
}

routes.forEach((route) => {
  route.addEventListener("click", (event) => {
    event.preventDefault();
    setRoute(route.dataset.route);
  });
});

window.addEventListener("hashchange", () => {
  const route = location.hash.replace("#", "") || "dashboard";
  setRoute(titles[route] ? route : "dashboard");
});

document.querySelectorAll("[data-range]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-range]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderChart(button.dataset.range);
  });
});

[globalSearch, marketFilter, sourceFilter, scoreFilter].forEach((control) => {
  control.addEventListener("input", () => {
    scoreOutput.textContent = `${scoreFilter.value}+`;
    renderSignals();
    renderAds();
  });
});

document.querySelector("#connectButton").addEventListener("click", () => {
  document.querySelector("#storeStatus").textContent = "Shopify connected";
  document.querySelector("#connectButton").textContent = "Connected";
});

document.querySelector("#scanAdsButton").addEventListener("click", () => {
  renderBrief();
  document.querySelector("#scanAdsButton").textContent = "Scanned";
});

document.querySelector("#promptForm").addEventListener("submit", (event) => {
  event.preventDefault();
  renderAnalyst(new FormData(event.currentTarget).get("prompt"));
});

document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#leadPlan").value = button.dataset.plan;
    document.querySelector("#leadForm input[name='name']").focus();
  });
});

document.querySelector("#leadForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  leads.push({ name: form.get("name"), email: form.get("email"), plan: form.get("plan"), createdAt: new Date().toISOString() });
  localStorage.setItem("signalpilot_leads", JSON.stringify(leads));
  updateLeadSummary();
  event.currentTarget.reset();
  document.querySelector("#leadPlan").value = "Growth";
});

document.querySelectorAll("[data-open-upgrade]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector("#upgradeModal").showModal());
});

document.querySelector("#upgradeModal").addEventListener("close", (event) => {
  if (event.currentTarget.returnValue === "upgrade") setRoute("billing");
});

const initialRoute = location.hash.replace("#", "") || "dashboard";
setRoute(titles[initialRoute] ? initialRoute : "dashboard");
renderChart("7");
renderSignals();
renderWatchlist();
renderAds();
renderBrief();
renderAnalyst();
updateLeadSummary();
requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
