import { useEffect, useState, useCallback } from "react";
import type {
  ExtensionSettings,
  HistoryEntry,
  Profile,
  RegionCode,
  GenderMode,
  FillSummary,
} from "@shared/types";
import { DEFAULT_SETTINGS } from "@shared/types";
import { applyTheme } from "@shared/themes";
import { t } from "@shared/i18n";
import {
  getSettings,
  saveSettings,
  getHistory,
  deleteHistory,
  getLastProfile,
  saveLastProfile,
} from "@shared/storage";
import { sendToBackground } from "@shared/messaging";
import Header from "./components/Header";
import MainScreen from "./components/MainScreen";
import SettingsScreen from "./components/SettingsScreen";
import HistoryScreen from "./components/HistoryScreen";
import ProfileEditor from "./components/ProfileEditor";
import Toast from "./components/Toast";

type Screen = "main" | "settings" | "history" | "editor";

const UNSUPPORTED_URL_PREFIXES = [
  "chrome://",
  "edge://",
  "brave://",
  "opera://",
  "vivaldi://",
  "about:",
  "chrome-extension://",
  "extension://",
  "moz-extension://",
  "devtools://",
  "view-source:",
];

const UNSUPPORTED_URL_PARTS = [
  "chromewebstore.google.com",
  "chrome.google.com/webstore",
  "microsoftedge.microsoft.com/addons",
];

function isUnsupportedUrl(url: string | undefined): boolean {
  if (!url) return true;
  if (UNSUPPORTED_URL_PREFIXES.some((p) => url.startsWith(p))) return true;
  if (UNSUPPORTED_URL_PARTS.some((p) => url.includes(p))) return true;
  if (url.toLowerCase().endsWith(".pdf")) return true;
  return false;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("main");
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [summary, setSummary] = useState<FillSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [apiFallback, setApiFallback] = useState(false);
  const [detectedCount, setDetectedCount] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  const lang = settings.language;

  // Bootstrap
  useEffect(() => {
    (async () => {
      try {
        const s = await getSettings();
        const h = await getHistory();
        const last = await getLastProfile();
        setSettings(s);
        setHistory(h);
        setProfile(last);
        applyTheme(s.theme);
      } catch (err) {
        console.error("[SFF] bootstrap error:", err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Re-apply theme on change
  useEffect(() => {
    if (ready) applyTheme(settings.theme);
  }, [settings.theme, ready]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const getActiveTab = useCallback(async (): Promise<chrome.tabs.Tab | null> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab ?? null;
  }, []);

  /**
   * Send a message to a tab's content script with a hard timeout.
   * Rejects with chrome.runtime.lastError message or timeout.
   */
  const sendToTabWithTimeout = useCallback(
    (tabId: number, message: any, timeoutMs = 5000): Promise<any> =>
      new Promise((resolve, reject) => {
        let settled = false;
        const timer = window.setTimeout(() => {
          if (settled) return;
          settled = true;
          reject(new Error("Timeout waiting for page response"));
        }, timeoutMs);

        try {
          chrome.tabs.sendMessage(tabId, message, (response) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            resolve(response);
          });
        } catch (err) {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      }),
    []
  );

  /**
   * Make sure the content script is alive in the given tab.
   * 1) PING — if it answers, nothing to do.
   * 2) Inject via scripting.executeScript.
   * 3) Wait a beat, PING again to confirm listener registered.
   * Throws typed error strings on failure:
   *   "unsupported-page"
   *   "injection-failed:<raw chrome error>"
   */
  const ensureContentScript = useCallback(
    async (tabId: number, url: string | undefined): Promise<void> => {
      if (isUnsupportedUrl(url)) {
        console.log("[SFF][inject] unsupported URL, aborting:", url);
        throw new Error("unsupported-page");
      }

      // Step 1: PING — maybe already there
      try {
        await sendToTabWithTimeout(tabId, { type: "PING" }, 800);
        console.log("[SFF][inject] content script already present");
        return;
      } catch (e) {
        console.log(
          "[SFF][inject] PING failed, will inject:",
          e instanceof Error ? e.message : String(e)
        );
      }

      // Step 2: inject
      try {
        console.log("[SFF][inject] executeScript → content/content-script.js");
        await chrome.scripting.executeScript({
          target: { tabId, allFrames: false },
          files: ["content/content-script.js"],
        });
        console.log("[SFF][inject] executeScript resolved OK");
      } catch (e) {
        const raw =
          e instanceof Error
            ? e.message
            : typeof e === "string"
            ? e
            : JSON.stringify(e);
        console.error("[SFF][inject] executeScript FAILED:", raw, e);
        throw new Error(`injection-failed:${raw}`);
      }

      // Step 3: verify listener registered
      await new Promise((r) => setTimeout(r, 80));
      try {
        await sendToTabWithTimeout(tabId, { type: "PING" }, 1500);
        console.log("[SFF][inject] content script injected and verified");
      } catch (e) {
        const raw = e instanceof Error ? e.message : String(e);
        console.error("[SFF][inject] post-injection PING failed:", raw);
        throw new Error(`injection-failed:${raw}`);
      }
    },
    [sendToTabWithTimeout]
  );

  /**
   * Map a caught error message to a user-facing toast key.
   * Keeps diagnostic detail in console; toast stays clean but honest.
   */
  const toastForError = useCallback(
    (msg: string) => {
      if (msg === "unsupported-page") {
        showToast(t(lang, "unsupportedPage"));
        return;
      }
      if (msg.startsWith("injection-failed")) {
        const detail = msg.slice("injection-failed:".length).trim();
        console.error("[SFF] injection detail:", detail);
        const short = detail.length > 90 ? detail.slice(0, 90) + "…" : detail;
        showToast(`${t(lang, "injectionFailed")} ${short}`);
        return;
      }
      if (msg === "no-tab" || msg === "empty-response") {
        showToast(t(lang, "fillError"));
        return;
      }
      if (msg.includes("Receiving end does not exist")) {
        showToast(t(lang, "contentNotReady"));
        return;
      }
      if (msg.toLowerCase().includes("timeout")) {
        showToast(t(lang, "pageTimeout"));
        return;
      }
      showToast(t(lang, "fillError"));
    },
    [lang, showToast]
  );

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setApiFallback(false);
    try {
      const res = await sendToBackground<{
        profile: Profile;
        usedFallback: boolean;
        historyId: string;
      }>({
        type: "GENERATE_PROFILE",
        region: settings.region,
        genderMode: settings.genderMode,
      });
      setProfile(res.profile);
      setApiFallback(res.usedFallback);
      const h = await getHistory();
      setHistory(h);
      if (res.usedFallback) {
        showToast(t(lang, "apiError"));
      }
    } catch (err) {
      console.error("[SFF] generate error:", err);
      showToast(t(lang, "networkError"));
    } finally {
      setLoading(false);
    }
  }, [settings.region, settings.genderMode, lang, showToast]);

  const handleFill = useCallback(async () => {
    if (!profile) {
      await handleGenerate();
      return;
    }
    setLoading(true);
    setSummary(null);
    setDetectedCount(null);
    try {
      const tab = await getActiveTab();
      if (!tab?.id || !tab.url) {
        throw new Error("no-tab");
      }
      console.log("[SFF] fill requested for tab", tab.id, tab.url);

      await ensureContentScript(tab.id, tab.url);

      const res = await sendToTabWithTimeout(
        tab.id,
        { type: "FILL_PAGE", profile, settings },
        6000
      );

      if (!res) throw new Error("empty-response");
      if (!res.ok) throw new Error(res.error || "fill-failed");

      setSummary(res.summary);
      setDetectedCount(res.summary.found);
      showToast(t(lang, "fillComplete"));
      console.log("[SFF] fill summary:", res.summary);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[SFF] fill error:", msg);
      toastForError(msg);
    } finally {
      setLoading(false);
    }
  }, [
    profile,
    settings,
    lang,
    handleGenerate,
    getActiveTab,
    showToast,
    ensureContentScript,
    sendToTabWithTimeout,
    toastForError,
  ]);

  const handleClear = useCallback(async () => {
    setLoading(true);
    try {
      const tab = await getActiveTab();
      if (!tab?.id || !tab.url) throw new Error("no-tab");
      await ensureContentScript(tab.id, tab.url);
      await sendToTabWithTimeout(tab.id, { type: "CLEAR_PAGE" }, 4000);
      setSummary(null);
      setDetectedCount(null);
      showToast(t(lang, "clear"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[SFF] clear error:", msg);
      toastForError(msg);
    } finally {
      setLoading(false);
    }
  }, [
    lang,
    getActiveTab,
    showToast,
    ensureContentScript,
    sendToTabWithTimeout,
    toastForError,
  ]);

  const handleSaveSettings = useCallback(
    async (next: ExtensionSettings) => {
      setSettings(next);
      try {
        await saveSettings(next);
        showToast(t(next.language, "settingsSaved"));
      } catch (err) {
        console.error("[SFF] saveSettings error:", err);
      }
    },
    [showToast]
  );

  const handleSaveProfile = useCallback(async (p: Profile) => {
    setProfile(p);
    try {
      await saveLastProfile(p);
    } catch (err) {
      console.error("[SFF] saveLastProfile error:", err);
    }
    setScreen("main");
  }, []);

  const handleDeleteHistory = useCallback(async (id: string) => {
    try {
      await deleteHistory(id);
      const h = await getHistory();
      setHistory(h);
    } catch (err) {
      console.error("[SFF] deleteHistory error:", err);
    }
  }, []);

  const handleReuse = useCallback((p: Profile) => {
    setProfile(p);
    setScreen("main");
  }, []);

  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast(t(lang, "copied")))
        .catch((err) => {
          console.error("[SFF] clipboard error:", err);
          showToast(t(lang, "fillError"));
        });
    },
    [lang, showToast]
  );

  const handleRegionChange = useCallback((region: RegionCode) => {
    setSettings((s) => ({ ...s, region }));
  }, []);

  const handleGenderChange = useCallback((genderMode: GenderMode) => {
    setSettings((s) => ({ ...s, genderMode }));
  }, []);

  if (!ready) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        lang={lang}
        screen={screen}
        onBack={() => setScreen("main")}
        onOpenSettings={() => setScreen("settings")}
        onOpenHistory={() => setScreen("history")}
      />

      {screen === "main" && (
        <MainScreen
          lang={lang}
          profile={profile}
          settings={settings}
          loading={loading}
          summary={summary}
          detectedCount={detectedCount}
          apiFallback={apiFallback}
          onFill={handleFill}
          onGenerate={handleGenerate}
          onClear={handleClear}
          onOpenEditor={() => setScreen("editor")}
          onCopy={handleCopy}
          onRegionChange={handleRegionChange}
          onGenderChange={handleGenderChange}
          onSettingsChange={handleSaveSettings}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen
          lang={lang}
          settings={settings}
          onChange={handleSaveSettings}
        />
      )}

      {screen === "history" && (
        <HistoryScreen
          lang={lang}
          history={history}
          onReuse={handleReuse}
          onDelete={handleDeleteHistory}
          onCopy={handleCopy}
        />
      )}

      {screen === "editor" && profile && (
        <ProfileEditor
          lang={lang}
          profile={profile}
          onSave={handleSaveProfile}
          onCancel={() => setScreen("main")}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}