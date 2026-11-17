import type {
  ExtensionSettings,
  HistoryEntry,
  Profile,
} from "./types";
import { DEFAULT_SETTINGS } from "./types";

const KEY_SETTINGS = "sff_settings";
const KEY_HISTORY = "sff_history";
const KEY_LAST_PROFILE = "sff_last_profile";
const MAX_HISTORY = 20;

export async function getSettings(): Promise<ExtensionSettings> {
  const res = await chrome.storage.local.get(KEY_SETTINGS);
  const stored = res[KEY_SETTINGS] as Partial<ExtensionSettings> | undefined;
  if (!stored) return { ...DEFAULT_SETTINGS };
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    enabledFields: {
      ...DEFAULT_SETTINGS.enabledFields,
      ...(stored.enabledFields ?? {}),
    },
    customRules: stored.customRules ?? [],
  };
}

export async function saveSettings(s: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({ [KEY_SETTINGS]: s });
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const res = await chrome.storage.local.get(KEY_HISTORY);
  return (res[KEY_HISTORY] as HistoryEntry[] | undefined) ?? [];
}

export async function addHistory(entry: HistoryEntry): Promise<void> {
  const current = await getHistory();
  const next = [entry, ...current].slice(0, MAX_HISTORY);
  await chrome.storage.local.set({ [KEY_HISTORY]: next });
}

export async function deleteHistory(id: string): Promise<void> {
  const current = await getHistory();
  const next = current.filter((e) => e.id !== id);
  await chrome.storage.local.set({ [KEY_HISTORY]: next });
}

export async function getLastProfile(): Promise<Profile | null> {
  const res = await chrome.storage.local.get(KEY_LAST_PROFILE);
  return (res[KEY_LAST_PROFILE] as Profile | undefined) ?? null;
}

export async function saveLastProfile(p: Profile): Promise<void> {
  await chrome.storage.local.set({ [KEY_LAST_PROFILE]: p });
}