import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StoreState } from "./types";

const storePath = path.join(process.cwd(), ".data", "store.json");

const defaultStore: StoreState = {
  saved: [],
  leads: [],
  checkoutSessions: [],
  storeConnected: false,
};

let writeQueue: Promise<StoreState> = Promise.resolve(defaultStore);

export async function readStore(): Promise<StoreState> {
  try {
    const raw = await readFile(storePath, "utf8");
    return { ...defaultStore, ...(JSON.parse(raw) as Partial<StoreState>) };
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
