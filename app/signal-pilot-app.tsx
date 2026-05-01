"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import type { Ad, AnalystResult, Lead, Signal, WorkspaceState } from "./lib/types";

type Route = "dashboard" | "signals" | "ads" | "analyst" | "billing";

type BootstrapPayload = {
  ads: Ad[];
  analyst: AnalystResult;
  creativeBrief: string[];
  signals: Signal[];
  store: WorkspaceState;
};

const chartRanges = {
  "7": [42, 54, 49, 68, 74, 82, 88, 94],
  "30": [36, 48, 55, 62, 69, 73, 80, 87],
  "90": [28, 36, 44, 50, 59, 66, 74, 82],
};

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Now"];

const titles: Record<Route, string> = {
  dashboard: "Command center",
  signals: "Signal explorer",
  ads: "Ad library",
  analyst: "AI analyst",
  billing: "Plans and billing",
};

const defaultAnalyst: AnalystResult = {
  prompt: "Find a product angle for recovery and sleep buyers",
  response:
    "Recovery gummies are the strongest near-term angle. Demand is moving through creator routines, buyer intent is high, and ad saturation is still moderate outside the biggest brands.",
  plan: [
    "Position the offer around next-day energy instead of generic recovery.",
    "Bundle a 30-day supply with a sleep-tracking challenge.",
    "Launch three UGC concepts: gym bag routine, bedtime stack and soreness myth-busting.",
    "Retarget viewers with a comparison page against magnesium capsules.",
  ],
};

const defaultCreativeBrief = [
  "Lead with a visible transformation in the first two seconds.",
  "Use routine-based hooks for repeat-purchase categories.",
  "Show the product in a real room, gym bag or bathroom counter.",
  "Test one founder-demo angle against one creator POV angle.",
];

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function SignalPilotApp() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const [route, setRoute] = useState<Route>("dashboard");
  const [range, setRange] = useState<keyof typeof chartRanges>("7");
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState("all");
  const [source, setSource] = useState("all");
  const [score, setScore] = useState(70);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [creativeBrief, setCreativeBrief] = useState(defaultCreativeBrief);
  const [storeConnected, setStoreConnected] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [prompt, setPrompt] = useState(defaultAnalyst.prompt);
  const [analyst, setAnalyst] = useState<AnalystResult>(defaultAnalyst);
  const [leadPlan, setLeadPlan] = useState("Growth");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    apiJson<BootstrapPayload>("/api/bootstrap")
      .then((payload) => {
        if (!active) return;
        setSignals(payload.signals);
        setAds(payload.ads);
        setSaved(payload.store?.saved || []);
        setLeads(payload.store?.leads || []);
        setStoreConnected(Boolean(payload.store?.storeConnected));
        setCreativeBrief(payload.creativeBrief);
        setAnalyst(payload.analyst);
        setPrompt(payload.analyst.prompt);
      })
      .catch((error: Error) => setStatusMessage(`App data kon niet laden: ${error.message}`))
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.replaceState(null, "", `#${route}`);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [route]);

  const searchMatches = (item: Signal | Ad) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return Object.values(item).join(" ").toLowerCase().includes(needle);
  };

  const filteredSignals = useMemo(() => {
    return signals.filter((signal) => {
      return (
        searchMatches(signal) &&
        (market === "all" || signal.market === market) &&
        (source === "all" || signal.source === source) &&
        signal.score >= score
      );
    });
  }, [query, market, score, signals, source]);

  const filteredAds = useMemo(() => ads.filter(searchMatches), [ads, query]);
  const savedSignals = signals.filter((signal) => saved.includes(signal.id));
  const chartValues = chartRanges[range];
  const opportunityScore = Math.round(chartValues.at(-1)! - 7);
  const storeStatus = storeConnected ? "Shopify connected" : clerkConfigured ? "Private workspace" : "Demo workspace";

  const toggleSaved = async (id: number) => {
    const previous = saved;
    const optimistic = previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id];
    setSaved(optimistic);

    try {
      const result = await apiJson<{ saved: number[] }>("/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ signalId: id }),
      });
      setSaved(result.saved);
      setStatusMessage("Watchlist opgeslagen.");
    } catch (error) {
      setSaved(previous);
      setStatusMessage(error instanceof Error ? error.message : "Watchlist opslaan mislukt.");
    }
  };

  const connectStore = async () => {
    setStoreConnected(true);
    try {
      await apiJson<{ storeConnected: boolean }>("/api/store/connect", { method: "POST" });
      setStatusMessage("Store connectie opgeslagen.");
    } catch (error) {
      setStoreConnected(false);
      setStatusMessage(error instanceof Error ? error.message : "Store koppelen mislukt.");
    }
  };

  const submitPrompt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const previous = analyst;
    setAnalyst({ ...analyst, prompt });

    try {
      const result = await apiJson<AnalystResult>("/api/analyst", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      setAnalyst(result);
      setStatusMessage("AI analyst plan gegenereerd.");
    } catch (error) {
      setAnalyst(previous);
      setStatusMessage(error instanceof Error ? error.message : "AI analyst mislukt.");
    }
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      plan: String(form.get("plan") || "Growth"),
    };

    try {
      const result = await apiJson<{ lead: Lead; leads: Lead[] }>("/api/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setLeads(result.leads);
      setStatusMessage(`Trial request opgeslagen voor ${result.lead.plan}.`);
      event.currentTarget.reset();
      setLeadPlan("Growth");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Trial request opslaan mislukt.");
    }
  };

  const startCheckout = async (plan: string) => {
    setLeadPlan(plan);

    try {
      const result = await apiJson<{ mode: string; session: { id: string; plan: string } }>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      setRoute("billing");
      setStatusMessage(`Demo checkout aangemaakt voor ${result.session.plan}. Stripe kan hier straks op aansluiten.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Checkout starten mislukt.");
    }
  };

  return (
    <div className="app">
      <aside className="sidebar" aria-label="App navigation">
        <button className="brand brand-button" type="button" onClick={() => setRoute("dashboard")}>
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <strong>SignalPilot</strong>
            <small>Growth OS</small>
          </span>
        </button>

        <nav className="nav-list">
          {Object.entries(titles).map(([key]) => (
            <button
              className={`nav-item ${route === key ? "active" : ""}`}
              key={key}
              type="button"
              onClick={() => setRoute(key as Route)}
            >
              {key === "ads" ? "Ad Library" : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </nav>

        <section className="workspace-card" aria-label="Current workspace">
          <span className="workspace-dot" />
          <div>
            <WorkspaceIdentity configured={clerkConfigured} />
            <small>{storeStatus}</small>
          </div>
        </section>

        <section className="usage-card" aria-label="Plan usage">
          <div>
            <span>Signals used</span>
            <strong>1,842 / 2,500</strong>
          </div>
          <div className="usage-bar">
            <span />
          </div>
          <button className="secondary-button full" type="button" onClick={() => setUpgradeOpen(true)}>
            Upgrade
          </button>
        </section>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Today&apos;s market radar</p>
            <h1>{titles[route]}</h1>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <span className="sr-only">Search</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search product, niche, brand"
                type="search"
                value={query}
              />
            </label>
            <button className="secondary-button" type="button" onClick={connectStore}>
              {storeConnected ? "Connected" : "Connect store"}
            </button>
            <button className="primary-button" type="button" onClick={() => setUpgradeOpen(true)}>
              Upgrade
            </button>
            <AuthControls configured={clerkConfigured} />
          </div>
        </header>

        {statusMessage && (
          <div className="status-banner" role="status">
            {statusMessage}
          </div>
        )}

        {isLoading && <div className="panel">App data laden...</div>}

        {!isLoading && route === "dashboard" && (
          <section className="view active" aria-label="Dashboard">
            <div className="kpi-grid">
              <Kpi label="Opportunity score" value={opportunityScore} note="+12 this week" />
              <Kpi label="Winning angles" value={36} note="14 ready to test" />
              <Kpi label="Competitor moves" value={128} note="7 budget spikes" />
              <Kpi label="Saved signals" value={saved.length} note="Synced to watchlist" />
            </div>

            <div className="dashboard-layout">
              <section className="panel chart-panel">
                <div className="panel-head">
                  <div>
                    <h2>Momentum forecast</h2>
                    <p>Category velocity by source and buyer intent.</p>
                  </div>
                  <div className="segmented" aria-label="Time range">
                    {(["7", "30", "90"] as const).map((item) => (
                      <button
                        className={`segment ${range === item ? "active" : ""}`}
                        key={item}
                        type="button"
                        onClick={() => setRange(item)}
                      >
                        {item}d
                      </button>
                    ))}
                  </div>
                </div>
                <div className="chart" aria-label="Momentum chart">
                  {chartValues.map((value, index) => (
                    <div
                      className="bar"
                      data-label={labels[index]}
                      key={labels[index]}
                      style={{ height: `${value}%` }}
                      title={`${labels[index]}: ${value}`}
                    />
                  ))}
                </div>
              </section>

              <section className="panel watchlist-panel">
                <div className="panel-head">
                  <div>
                    <h2>Watchlist</h2>
                    <p>Highest priority saved signals.</p>
                  </div>
                  <span className="live-pill">Live</span>
                </div>
                <div className="watchlist">
                  {savedSignals.length ? (
                    savedSignals.slice(0, 3).map((signal) => (
                      <SignalCard key={signal.id} saved={saved.includes(signal.id)} signal={signal} onSave={toggleSaved} />
                    ))
                  ) : (
                    <div className="watch-empty">Save signals to build this week&apos;s launch shortlist.</div>
                  )}
                </div>
              </section>
            </div>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Hot opportunities</h2>
                  <p>Sorted by intent, speed and competitive whitespace.</p>
                </div>
                <button className="secondary-button" type="button" onClick={() => setRoute("signals")}>
                  Open signals
                </button>
              </div>
              <OpportunityTable rows={filteredSignals.slice(0, 5)} />
            </section>
          </section>
        )}

        {!isLoading && route === "signals" && (
          <section className="view active" aria-label="Signals">
            <div className="tool-row">
              <label>
                Market
                <select onChange={(event) => setMarket(event.target.value)} value={market}>
                  <option value="all">All markets</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Home">Home</option>
                  <option value="Pets">Pets</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Tech">Tech</option>
                </select>
              </label>
              <label>
                Source
                <select onChange={(event) => setSource(event.target.value)} value={source}>
                  <option value="all">All sources</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Meta">Meta</option>
                  <option value="Search">Search</option>
                  <option value="Amazon">Amazon</option>
                </select>
              </label>
              <label>
                Minimum score
                <input
                  max="95"
                  min="50"
                  onChange={(event) => setScore(Number(event.target.value))}
                  type="range"
                  value={score}
                />
              </label>
              <output>{score}+</output>
            </div>
            <div className="signal-grid">
              {filteredSignals.length ? (
                filteredSignals.map((signal) => (
                  <SignalCard key={signal.id} saved={saved.includes(signal.id)} signal={signal} onSave={toggleSaved} />
                ))
              ) : (
                <div className="watch-empty">No signals match the current filters.</div>
              )}
            </div>
          </section>
        )}

        {!isLoading && route === "ads" && (
          <section className="view active" aria-label="Ad library">
            <div className="ad-layout">
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Ad intelligence</h2>
                    <p>Creative patterns gaining spend across active campaigns.</p>
                  </div>
                  <button className="primary-button" type="button" onClick={() => setScanComplete(true)}>
                    {scanComplete ? "Scanned" : "Scan ads"}
                  </button>
                </div>
                <div className="ad-grid">
                  {filteredAds.map((ad) => (
                    <article className="ad-card" key={ad.brand}>
                      <div className="ad-creative" />
                      <div className="ad-body">
                        <h3>{ad.brand}</h3>
                        <p>{ad.hook}</p>
                        <div className="meta-row">
                          <span className="tag">{ad.format}</span>
                          <span className="tag">{ad.spend}</span>
                          <span className="status-pill hot">{ad.lift}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
              <aside className="panel insight-panel">
                <h2>Creative brief</h2>
                <ul className="brief-list">
                  {creativeBrief.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </aside>
            </div>
          </section>
        )}

        {!isLoading && route === "analyst" && (
          <section className="view active" aria-label="AI analyst">
            <div className="analyst-layout">
              <section className="panel chat-panel">
                <div className="panel-head">
                  <div>
                    <h2>AI market analyst</h2>
                    <p>Turns live signals into a launch plan.</p>
                  </div>
                </div>
                <div className="chat-log">
                  <div className="chat-message user">{analyst.prompt}</div>
                  <div className="chat-message ai">{analyst.response}</div>
                </div>
                <form className="prompt-form" onSubmit={submitPrompt}>
                  <input onChange={(event) => setPrompt(event.target.value)} type="text" value={prompt} />
                  <button className="primary-button" type="submit">
                    Run
                  </button>
                </form>
              </section>
              <aside className="panel launch-plan">
                <h2>Launch plan</h2>
                <ol>
                  {analyst.plan.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </aside>
            </div>
          </section>
        )}

        {!isLoading && route === "billing" && (
          <section className="view active" aria-label="Billing">
            <div className="pricing-grid">
              {[
                ["Scout", "EUR 39", "For product hunters validating niches."],
                ["Growth", "EUR 99", "For brands launching weekly campaigns."],
                ["Studio", "EUR 249", "For agencies and multi-store teams."],
              ].map(([plan, price, description]) => (
                <article className={`price-card ${plan === "Growth" ? "featured" : ""}`} key={plan}>
                  <span>{plan}</span>
                  <strong>
                    {price}
                    <small>/mo</small>
                  </strong>
                  <p>{description}</p>
                  <button
                    className={`${plan === "Growth" ? "primary-button" : "secondary-button"} full`}
                    type="button"
                    onClick={() => startCheckout(plan)}
                  >
                    Choose {plan}
                  </button>
                </article>
              ))}
            </div>

            <section className="panel lead-panel">
              <div>
                <h2>Trial requests</h2>
                <p>{leads.length ? `${leads.length} saved request${leads.length === 1 ? "" : "s"} on the server.` : "No requests yet."}</p>
              </div>
              <form className="lead-form" onSubmit={submitLead}>
                <label>
                  Name
                  <input name="name" placeholder="Your name" required type="text" />
                </label>
                <label>
                  Email
                  <input name="email" placeholder="name@company.com" required type="email" />
                </label>
                <label>
                  Plan
                  <select name="plan" onChange={(event) => setLeadPlan(event.target.value)} value={leadPlan}>
                    <option>Scout</option>
                    <option>Growth</option>
                    <option>Studio</option>
                  </select>
                </label>
                <button className="primary-button" type="submit">
                  Save request
                </button>
              </form>
            </section>
          </section>
        )}
      </main>

      {upgradeOpen && (
        <div className="dialog-backdrop" role="presentation">
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
            <button className="close-button" type="button" onClick={() => setUpgradeOpen(false)} aria-label="Close">
              ×
            </button>
            <span className="modal-kicker">Growth plan</span>
            <h2 id="upgrade-title">Unlock the full research engine</h2>
            <p>2,500 monthly signals, unlimited watchlists, ad scans, AI launch plans and team seats.</p>
            <div className="modal-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  setUpgradeOpen(false);
                  void startCheckout("Growth");
                }}
              >
                Request upgrade
              </button>
              <button className="secondary-button" type="button" onClick={() => setUpgradeOpen(false)}>
                Maybe later
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, note, value }: { label: string; note: string; value: number }) {
  return (
    <article className="kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function WorkspaceIdentity({ configured }: { configured: boolean }) {
  if (!configured) {
    return <strong>North Basket</strong>;
  }

  return <strong>Private workspace</strong>;
}

function AuthControls({ configured }: { configured: boolean }) {
  if (!configured) {
    return <span className="auth-pill">Demo auth</span>;
  }

  return <ClerkAuthControls />;
}

function ClerkAuthControls() {
  return (
    <div className="auth-actions">
      <SignInButton mode="modal">
        <button className="secondary-button" type="button">
          Login
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="primary-button" type="button">
          Sign up
        </button>
      </SignUpButton>
      <UserButton />
    </div>
  );
}

function SignalCard({
  onSave,
  saved,
  signal,
}: {
  onSave: (id: number) => void;
  saved: boolean;
  signal: Signal;
}) {
  return (
    <article className="signal-card">
      <div>
        <h3>{signal.name}</h3>
        <p>{signal.angle}</p>
        <div className="meta-row">
          <span className="tag">{signal.market}</span>
          <span className="tag">{signal.source}</span>
          <span className="tag">Intent {signal.intent}%</span>
          <span className={`status-pill ${signal.status}`}>{signal.speed}</span>
        </div>
      </div>
      <span className="score-badge">{signal.score}</span>
      <button className={`save-button ${saved ? "saved" : ""}`} type="button" onClick={() => onSave(signal.id)}>
        {saved ? "Saved" : "Save signal"}
      </button>
    </article>
  );
}

function OpportunityTable({ rows }: { rows: Signal[] }) {
  return (
    <div className="table">
      <div className="table-row header">
        <span>Opportunity</span>
        <span>Market</span>
        <span>Source</span>
        <span>Score</span>
      </div>
      {rows.map((signal) => (
        <div className="table-row" key={signal.id}>
          <strong>{signal.name}</strong>
          <span>{signal.market}</span>
          <span>{signal.source}</span>
          <span className={`status-pill ${signal.status}`}>{signal.score}</span>
        </div>
      ))}
    </div>
  );
}
