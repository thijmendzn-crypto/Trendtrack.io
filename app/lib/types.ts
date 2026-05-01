export type SignalStatus = "hot" | "rising";

export type Signal = {
  id: number;
  name: string;
  market: string;
  source: string;
  score: number;
  intent: number;
  speed: string;
  status: SignalStatus;
  angle: string;
};

export type Ad = {
  brand: string;
  hook: string;
  spend: string;
  format: string;
  lift: string;
};

export type Shop = {
  id: number;
  name: string;
  domain: string;
  logoUrl: string;
  storefrontUrl: string;
  category: string;
  country: string;
  currency: string;
  monthlyVisits: string;
  metaAds: number;
  liveAds: number;
  products: number;
  trustpilot: string;
  traffic: number[];
  adTrend: number[];
  bestSellers: string[];
  adImages: string[];
  emailImages: string[];
  insight: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
};

export type CheckoutSession = {
  id: string;
  plan: string;
  status: "demo_created";
  createdAt: string;
};

export type WorkspaceState = {
  saved: number[];
  leads: Lead[];
  checkoutSessions: CheckoutSession[];
  storeConnected: boolean;
};

export type StoreState = {
  workspaces: Record<string, WorkspaceState>;
};

export type AnalystResult = {
  prompt: string;
  response: string;
  plan: string[];
};

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AssistantResponse = {
  message: AssistantMessage;
  suggestions: string[];
  source: "openai" | "local";
};
