import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readSupabaseWorkspace, updateSupabaseWorkspace } from "./supabase-store";
import type { StoreState, WorkspaceState } from "./types";

const storePath = path.join(process.cwd(), ".data", "store.json");

const defaultWorkspace: WorkspaceState = {
  saved: [],
  leads: [],
  checkoutSessions: [],
  storeConnected: false,
};

const defaultStore: StoreState = {
  workspaces: {
    "demo-user": defaultWorkspace,
  },
};

let writeQueue: Promise<StoreState> = Promise.resolve(defaultStore);

function normalizeStore(rawStore: Partial<StoreState> & Partial<WorkspaceState>): StoreState {
  if (rawStore.workspaces) {
    return { workspaces: rawStore.workspaces };
  }

  return {
    workspaces: {
      "demo-user": {
        ...defaultWorkspace,
        saved: rawStore.saved || defaultWorkspace.saved,
        leads: rawStore.leads || defaultWorkspace.leads,
        checkoutSessions: rawStore.checkoutSessions || defaultWorkspace.checkoutSessions,
        storeConnected: rawStore.storeConnected || defaultWorkspace.storeConnected,
      },
    },
  };
}

export async function readStore(): Promise<StoreState> {
  try {
    const raw = await readFile(storePath, "utf8");
    return normalizeStore(JSON.parse(raw) as Partial<StoreState> & Partial<WorkspaceState>);
  } catch {
    return defaultStore;
  }
}

export async function writeStore(store: StoreState) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2));
  return store;
}

export async function updateStore(updater: (store: StoreState) => StoreState | Promise<StoreState>) {
  writeQueue = writeQueue
    .catch(() => defaultStore)
    .then(async () => {
      const store = await readStore();
      const nextStore = await updater(store);
      return writeStore(nextStore);
    });

  return writeQueue;
}

export async function readWorkspace(actorId: string): Promise<WorkspaceState> {
  const supabaseWorkspace = await readSupabaseWorkspace(actorId);
  if (supabaseWorkspace) return supabaseWorkspace;

  const store = await readStore();
  return { ...defaultWorkspace, ...(store.workspaces[actorId] || {}) };
}

export async function updateWorkspace(
  actorId: string,
  updater: (workspace: WorkspaceState) => WorkspaceState | Promise<WorkspaceState>,
) {
  const supabaseWorkspace = await updateSupabaseWorkspace(actorId, updater);
  if (supabaseWorkspace) return supabaseWorkspace;

  const store = await updateStore(async (current) => {
    const currentWorkspace = { ...defaultWorkspace, ...(current.workspaces[actorId] || {}) };
    const nextWorkspace = await updater(currentWorkspace);

    return {
      ...current,
      workspaces: {
        ...current.workspaces,
        [actorId]: nextWorkspace,
      },
    };
  });

  return { ...defaultWorkspace, ...store.workspaces[actorId] };
}
