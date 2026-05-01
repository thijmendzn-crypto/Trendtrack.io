import { createClient } from "@supabase/supabase-js";
import { hasRealEnvValue } from "./env";
import type { WorkspaceState } from "./types";

type WorkspaceRow = {
  actor_id: string;
  saved: number[] | null;
  leads: WorkspaceState["leads"] | null;
  checkout_sessions: WorkspaceState["checkoutSessions"] | null;
  store_connected: boolean | null;
};

const defaultWorkspace: WorkspaceState = {
  saved: [],
  leads: [],
  checkoutSessions: [],
  storeConnected: false,
};

function isSupabaseConfigured() {
  return (
    hasRealEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL, ["https://"]) &&
    hasRealEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase is not configured");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function rowToWorkspace(row: WorkspaceRow | null): WorkspaceState {
  if (!row) return defaultWorkspace;

  return {
    saved: row.saved || [],
    leads: row.leads || [],
    checkoutSessions: row.checkout_sessions || [],
    storeConnected: Boolean(row.store_connected),
  };
}

export async function readSupabaseWorkspace(actorId: string): Promise<WorkspaceState | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await getSupabase()
    .from("workspaces")
    .select("actor_id,saved,leads,checkout_sessions,store_connected")
    .eq("actor_id", actorId)
    .maybeSingle<WorkspaceRow>();

  if (error) {
    throw error;
  }

  return rowToWorkspace(data);
}

export async function updateSupabaseWorkspace(
  actorId: string,
  updater: (workspace: WorkspaceState) => WorkspaceState | Promise<WorkspaceState>,
): Promise<WorkspaceState | null> {
  if (!isSupabaseConfigured()) return null;

  const current = (await readSupabaseWorkspace(actorId)) || defaultWorkspace;
  const next = await updater(current);

  const { data, error } = await getSupabase()
    .from("workspaces")
    .upsert(
      {
        actor_id: actorId,
        saved: next.saved,
        leads: next.leads,
        checkout_sessions: next.checkoutSessions,
        store_connected: next.storeConnected,
      },
      { onConflict: "actor_id" },
    )
    .select("actor_id,saved,leads,checkout_sessions,store_connected")
    .single<WorkspaceRow>();

  if (error) {
    throw error;
  }

  return rowToWorkspace(data);
}
