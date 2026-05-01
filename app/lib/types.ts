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
