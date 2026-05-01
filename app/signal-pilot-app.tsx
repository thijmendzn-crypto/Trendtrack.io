"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Ad, AssistantMessage, AssistantResponse, Lead, Shop, Signal, WorkspaceState } from "./lib/types";

type Route = "home" | "shops" | "ads" | "emails" | "trends" | "assistant" | "billing";

type BootstrapPayload = {
  ads: Ad[];
  creativeBrief: string[];
  shops: Shop[];
  signals: Signal[];
  store: WorkspaceState;
};

const titles: Record<Route, string> = {
  home: "Home",
  shops: "Shops",
  ads: "Ads",
  emails: "Email",
  trends: "Trends",
  assistant: "AI Assistant",
  billing: "Billing",
};

const navGroups: Array<{ label: string; items: Route[] }> = [
  { label: "Overview", items: ["home"] },
  { label: "Analyse", items: ["shops", "ads", "emails", "trends", "assistant"] },
  { label: "Account", items: ["billing"] },
];

const defaultAssistant: AssistantMessage[] = [
  {
    id: "assistant-welcome",
    role: "assistant",
    content:
      "Ask me which shop to analyze, which emails to copy ethically, or which ad angle to test next. I can use the shop table as context.",
  },
];

function getVisitorId(): string {
  const key = "tt_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const visitorId = typeof window !== "undefined" ? getVisitorId() : "ssr";
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-visitor-id": visitorId,
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function SignalPilotApp() {
  const [route, setRoute] = useState<Route>("shops");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [shops, setShops] = useState<Shop[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [storeConnected, setStoreConnected] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>(defaultAssistant);
  const [assistantPrompt, setAssistantPrompt] = useState("Which shop should I research first?");
  const [assistantSource, setAssistantSource] = useState<"groq" | "openai" | "local">("local");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    apiJson<BootstrapPayload>("/api/bootstrap")
      .then((payload) => {
        if (!active) return;
        setAds(payload.ads);
        setLeads(payload.store?.leads || []);
        setShops(payload.shops || []);
        setSignals(payload.signals || []);
        setStoreConnected(Boolean(payload.store?.storeConnected));
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
  }, [route]);

  const filteredShops = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return shops.filter((shop) => {
      const matchesSearch = !needle || Object.values(shop).join(" ").toLowerCase().includes(needle);
      const matchesCategory = category === "all" || shop.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, query, shops]);

  const categories = useMemo(() => Array.from(new Set(shops.map((shop) => shop.category))), [shops]);
  const heroShop = filteredShops[0] || shops[0];
  const totalAds = shops.reduce((total, shop) => total + shop.metaAds, 0);
  const storeStatus = storeConnected ? "Store connected" : "Your workspace";

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

  const submitAssistant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = assistantPrompt.trim();
    if (!prompt) return;

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
    };

    setAssistantMessages((current) => [...current, userMessage]);
    setAssistantPrompt("");

    try {
      const result = await apiJson<AssistantResponse>("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      setAssistantSource(result.source);
      setAssistantMessages((current) => [...current, result.message]);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "AI assistent mislukt.");
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
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Trial request opslaan mislukt.");
    }
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="App navigation">
        <button className="brand-button" type="button" onClick={() => setRoute("shops")}>
          <span className="brand-mark" aria-hidden="true">
            T
          </span>
          <strong>Trendtrack</strong>
        </button>

        <nav className="side-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span>{group.label}</span>
              {group.items.map((item) => (
                <button
                  className={`side-link ${route === item ? "active" : ""}`}
                  key={item}
                  type="button"
                  onClick={() => setRoute(item)}
                >
                  <span aria-hidden="true">{navIcon(item)}</span>
                  {titles[item]}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-card">
          <small>{storeStatus}</small>
          <button className="side-action" type="button" onClick={connectStore}>
            {storeConnected ? "Connected" : "Connect store"}
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <div className="title-row">
            <h1>{titles[route]}</h1>
            {route === "shops" && <span className="count-pill">{shops.length ? "1 500 046" : "Loading"}</span>}
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <span className="sr-only">Search shops</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search shops, keywords"
                type="search"
                value={query}
              />
            </label>
            <button className="icon-button" type="button" aria-label="Open AI assistant" onClick={() => setRoute("assistant")}>
              AI
            </button>
          </div>
        </header>

        {statusMessage && (
          <div className="status-banner" role="status">
            {statusMessage}
          </div>
        )}

        {isLoading && <section className="soft-panel">App data laden...</section>}

        {!isLoading && route === "shops" && (
          <section className="shops-view" aria-label="Shops">
            <div className="tab-strip">
              {["All Shops", "Weekly Gems", "Top Scaling", "Market Leaders & DTC Brands", "Shop's Ad Peak"].map((tab, index) => (
                <button className={`tab-button ${index === 0 ? "active" : ""}`} key={tab} type="button">
                  {tab}
                </button>
              ))}
            </div>

            <div className="filter-panel">
              <div className="filter-head">
                <span>FILTERS</span>
                <button className="filter-token active" type="button">
                  Shops
                </button>
                <button className="filter-token" type="button">
                  Ads
                </button>
              </div>
              <div className="filter-grid">
                <button className="filter-chip" type="button">
                  Traffic
                </button>
                <button className="filter-chip" type="button">
                  Traffic Growth
                </button>
                <button className="filter-chip" type="button">
                  Products
                </button>
                <button className="filter-chip" type="button">
                  Shop Origin
                </button>
                <button className="filter-chip" type="button">
                  Visitor Country
                </button>
                <select aria-label="Category filter" onChange={(event) => setCategory(event.target.value)} value={category}>
                  <option value="all">Niche</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <button className="filter-chip" type="button">
                  Creation Date
                </button>
                <button className="filter-chip" type="button">
                  Language
                </button>
                <button className="filter-chip" type="button">
                  Currency
                </button>
                <button className="filter-chip" type="button">
                  Shopify Theme
                </button>
                <button className="filter-chip" type="button">
                  Trustpilot
                </button>
              </div>
            </div>

            <div className="table-toolbar">
              <button className="filter-chip" type="button">
                Live Ads
              </button>
              <button className="primary-button" type="button" onClick={() => setRoute("assistant")}>
                Ask AI
              </button>
            </div>

            <ShopTable shops={filteredShops} />
          </section>
        )}

        {!isLoading && route === "home" && (
          <section className="home-grid">
            <Metric label="Tracked shops" value="1.5M" detail={`${shops.length} demo rows loaded`} />
            <Metric label="Meta ads" value={totalAds} detail="Across visible shops" />
            <Metric label="Signals" value={signals.length} detail="Products and niches" />
            <Metric label="Leads" value={leads.length} detail="Saved in workspace" />
            {heroShop && (
              <article className="hero-shop">
                <img alt="" src={heroShop.storefrontUrl} />
                <div>
                  <span className="section-kicker">Best next research target</span>
                  <h2>{heroShop.name}</h2>
                  <p>{heroShop.insight}</p>
                  <button className="primary-button" type="button" onClick={() => setRoute("shops")}>
                    Open shops
                  </button>
                </div>
              </article>
            )}
          </section>
        )}

        {!isLoading && route === "ads" && (
          <section className="media-grid">
            {shops.flatMap((shop) =>
              shop.adImages.map((image, index) => (
                <article className="media-card" key={`${shop.id}-${image}`}>
                  <img alt="" src={image} />
                  <strong>{shop.name}</strong>
                  <span>Meta creative #{index + 1}</span>
                </article>
              )),
            )}
          </section>
        )}

        {!isLoading && route === "emails" && (
          <section className="media-grid">
            {shops.flatMap((shop) =>
              shop.emailImages.map((image, index) => (
                <article className="media-card" key={`${shop.id}-email-${image}`}>
                  <img alt="" src={image} />
                  <strong>{shop.name}</strong>
                  <span>Email drop #{index + 1}</span>
                </article>
              )),
            )}
          </section>
        )}

        {!isLoading && route === "trends" && (
          <section className="trend-list">
            {signals.map((signal) => (
              <article className="trend-card" key={signal.id}>
                <span className={`status-pill ${signal.status}`}>{signal.speed}</span>
                <h2>{signal.name}</h2>
                <p>{signal.angle}</p>
                <div className="meta-row">
                  <span>{signal.market}</span>
                  <span>{signal.source}</span>
                  <span>Score {signal.score}</span>
                </div>
              </article>
            ))}
          </section>
        )}

        {!isLoading && route === "assistant" && (
          <AssistantPanel
            messages={assistantMessages}
            prompt={assistantPrompt}
            source={assistantSource}
            onPromptChange={setAssistantPrompt}
            onSubmit={submitAssistant}
          />
        )}

        {!isLoading && route === "billing" && (
          <section className="billing-grid">
            {[
              ["Scout", "EUR 39", "For product hunters validating niches."],
              ["Growth", "EUR 99", "For brands launching weekly campaigns."],
              ["Studio", "EUR 249", "For agencies and multi-store teams."],
            ].map(([plan, price, description]) => (
              <article className={`price-card ${plan === "Growth" ? "featured" : ""}`} key={plan}>
                <span>{plan}</span>
                <strong>{price}</strong>
                <p>{description}</p>
              </article>
            ))}
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
                <select name="plan">
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
        )}
      </main>
    </div>
  );
}

function navIcon(route: Route) {
  const icons: Record<Route, string> = {
    home: "H",
    shops: "S",
    ads: "Ad",
    emails: "@",
    trends: "^",
    assistant: "AI",
    billing: "$",
  };

  return icons[route];
}


function ShopTable({ shops }: { shops: Shop[] }) {
  return (
    <div className="shop-table">
      <div className="shop-row header">
        <span>Shop Infos</span>
        <span>Best-Selling Products</span>
        <span>Category</span>
        <span>Monthly Visits</span>
        <span>Meta Ads</span>
        <span>Ads</span>
      </div>

      {shops.map((shop, index) => (
        <article className={`shop-row ${index === 0 ? "featured" : ""}`} key={shop.id}>
          <div className="shop-info">
            <img alt="" src={shop.storefrontUrl} />
            <div>
              <strong>{shop.name}</strong>
              <span>{shop.domain}</span>
              <small>
                {shop.country} | {shop.currency} | Trustpilot {shop.trustpilot}
              </small>
            </div>
          </div>
          <ImageStack count={shop.products} images={shop.bestSellers} />
          <span className="category-pill">{shop.category}</span>
          <Sparkline label={shop.monthlyVisits} tone="green" values={shop.traffic} />
          <Sparkline label={String(shop.metaAds)} tone={shop.metaAds > 10 ? "green" : "red"} values={shop.adTrend} />
          <ImageStrip images={shop.adImages} />
        </article>
      ))}
    </div>
  );
}

function ImageStack({ count, images }: { count: number; images: string[] }) {
  return (
    <div className="image-stack">
      <div>
        {images.map((image) => (
          <img alt="" key={image} src={image} />
        ))}
      </div>
      <small>{count}</small>
    </div>
  );
}

function ImageStrip({ images }: { images: string[] }) {
  return (
    <div className="image-strip">
      {images.map((image) => (
        <img alt="" key={image} src={image} />
      ))}
    </div>
  );
}

function Sparkline({ label, tone, values }: { label: string; tone: "green" | "red"; values: number[] }) {
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 58 - (value / 60) * 48;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="spark-cell">
      <strong>{label}</strong>
      <svg className={`sparkline ${tone}`} viewBox="0 0 100 62" role="img" aria-label={`${label} trend`}>
        <polyline points={`0,60 ${points} 100,60`} />
        <path d={`M ${points}`} />
      </svg>
    </div>
  );
}

function Metric({ detail, label, value }: { detail: string; label: string; value: number | string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function AssistantPanel({
  messages,
  onPromptChange,
  onSubmit,
  prompt,
  source,
}: {
  messages: AssistantMessage[];
  onPromptChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  prompt: string;
  source: "groq" | "openai" | "local";
}) {
  return (
    <section className="assistant-layout">
      <div className="assistant-chat">
        <div className="assistant-head">
          <div>
            <span className="section-kicker">Research copilot</span>
            <h2>AI Assistant</h2>
          </div>
          <span className="source-pill">
            {source === "groq" ? "Groq connected" : source === "openai" ? "OpenAI connected" : "Local fallback"}
          </span>
        </div>

        <div className="chat-log">
          {messages.map((message) => (
            <div className={`chat-message ${message.role}`} key={message.id}>
              {message.content}
            </div>
          ))}
        </div>

        <form className="prompt-form" onSubmit={onSubmit}>
          <input onChange={(event) => onPromptChange(event.target.value)} placeholder="Ask about shops, ads, emails..." type="text" value={prompt} />
          <button className="primary-button" type="submit">
            Send
          </button>
        </form>
      </div>

      <aside className="assistant-actions">
        <button type="button" onClick={() => onPromptChange("Analyze Obvi and give me the next ad angle")}>
          Analyze this shop
        </button>
        <button type="button" onClick={() => onPromptChange("Find winning email angles like Milled would show")}>
          Find email angles
        </button>
        <button type="button" onClick={() => onPromptChange("Write outreach copy for this brand")}>
          Write outreach
        </button>
      </aside>
    </section>
  );
}
