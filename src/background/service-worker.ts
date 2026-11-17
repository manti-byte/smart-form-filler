import type {
  BgMessage,
  HistoryEntry,
  Profile,
  RegionCode,
  GenderMode,
} from "@shared/types";
import {
  addHistory,
  deleteHistory,
  getHistory,
  getSettings,
  saveLastProfile,
  saveSettings,
} from "@shared/storage";
import {
  generateLocalProfile,
  normalizeRandomUser,
} from "@shared/profile-generator";

const RANDOMUSER_BASE = "https://randomuser.me/api/";
const API_TIMEOUT_MS = 8000;

/** RandomUser.me nationality codes for our region dropdown. */
const REGION_TO_NAT: Record<Exclude<RegionCode, "random">, string> = {
  US: "us",
  GB: "gb",
  DE: "de",
  FR: "fr",
  NL: "nl",
  RU: "ru",
  PL: "pl",
  CA: "ca",
  AU: "au",
};

const GENDER_TO_PARAM: Record<GenderMode, string | null> = {
  random: null,
  male: "male",
  female: "female",
};

/**
 * Fetch a profile from RandomUser.me, falling back to the local
 * generator on any failure (network, timeout, rate limit, bad payload).
 */
async function fetchProfile(
  region: RegionCode,
  genderMode: GenderMode
): Promise<{ profile: Profile; usedFallback: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({ results: "1", noinfo: "" });
    if (region !== "random") {
      params.set("nat", REGION_TO_NAT[region]);
    }
    const genderParam = GENDER_TO_PARAM[genderMode];
    if (genderParam) {
      params.set("gender", genderParam);
    }

    const res = await fetch(`${RANDOMUSER_BASE}?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const raw = json?.results?.[0];
    if (!raw) throw new Error("Empty API result");

    const profile = normalizeRandomUser(raw, region);
    return { profile, usedFallback: false };
  } catch (err) {
    console.warn("[SFF] API failed, using local generator:", err);
    const profile = generateLocalProfile(region, genderMode);
    return { profile, usedFallback: true };
  } finally {
    clearTimeout(timer);
  }
}

/** Broadcast a message to all tabs; ignore tabs where the content script isn't loaded. */
async function broadcastToTabs(message: unknown): Promise<void> {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id == null) continue;
    try {
      await chrome.tabs.sendMessage(tab.id, message);
    } catch {
      // Content script not present in this tab — expected, ignore.
    }
  }
}

chrome.runtime.onMessage.addListener(
  (message: BgMessage, _sender, sendResponse) => {
    (async () => {
      try {
        switch (message.type) {
          case "GENERATE_PROFILE": {
            const { profile, usedFallback } = await fetchProfile(
              message.region,
              message.genderMode
            );
            await saveLastProfile(profile);

            const entry: HistoryEntry = {
              id: crypto.randomUUID(),
              profile,
              createdAt: Date.now(),
              region: message.region,
            };
            await addHistory(entry);

            sendResponse({
              ok: true,
              profile,
              usedFallback,
              historyId: entry.id,
            });
            return;
          }

          case "GET_SETTINGS": {
            const settings = await getSettings();
            sendResponse({ ok: true, settings });
            return;
          }

          case "SAVE_SETTINGS": {
            await saveSettings(message.settings);
            sendResponse({ ok: true });
            return;
          }

          case "GET_HISTORY": {
            const history = await getHistory();
            sendResponse({ ok: true, history });
            return;
          }

          case "ADD_HISTORY": {
            await addHistory(message.entry);
            sendResponse({ ok: true });
            return;
          }

          case "DELETE_HISTORY": {
            await deleteHistory(message.id);
            sendResponse({ ok: true });
            return;
          }

          default: {
            sendResponse({ ok: false, error: "Unknown message type" });
            return;
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[SFF] background error:", err);
        sendResponse({ ok: false, error: msg });
      }
    })();

    // Keep the message channel open for async response.
    return true;
  }
);

/** First-install setup: seed defaults so the popup has something to read. */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    const existing = await getSettings();
    await saveSettings(existing);
  }
});

/**
 * Keyboard shortcut (optional, wired via manifest commands later).
 * Kept as a hook so the popup and future hotkey share one code path.
 */
chrome.runtime.onMessageExternal.addListener(
  (_message, _sender, sendResponse) => {
    sendResponse({ ok: false, error: "External messages disabled" });
    return true;
  }
);

/** Broadcast a message to all tabs when the popup triggers a global action. */
export async function notifyTabsFillStarted(): Promise<void> {
  await broadcastToTabs({ type: "FILL_STARTED" });
}

export async function notifyTabsClearStarted(): Promise<void> {
  await broadcastToTabs({ type: "CLEAR_STARTED" });
}