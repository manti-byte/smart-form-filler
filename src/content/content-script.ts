import type { ContentMessage, FillSummary } from "@shared/types";
import { detectFields } from "./field-detector";
import { mapFieldsToProfile } from "./field-mapper";
import { executeFill, clearFilledFields } from "./filler";
import { showToast, showProgressBar } from "./overlay";
import { t } from "@shared/i18n";

const GLOBAL_FLAG = "__sffContentLoaded";

function init(): void {
  console.log("[SFF] content script initializing");

  chrome.runtime.onMessage.addListener(
    (message: ContentMessage, _sender, sendResponse) => {
      console.log("[SFF] content received message:", message.type);

      if (message.type === "FILL_PAGE") {
        handleFill(message.profile, message.settings)
          .then((summary) => sendResponse({ ok: true, summary }))
          .catch((err) => {
            console.error("[SFF] fill handler error:", err);
            sendResponse({ ok: false, error: String(err) });
          });
        return true;
      }

      if (message.type === "CLEAR_PAGE") {
        try {
          const cleared = clearFilledFields();
          sendResponse({ ok: true, cleared });
        } catch (err) {
          sendResponse({ ok: false, error: String(err) });
        }
        return false;
      }

      if (message.type === "DETECT_ONLY") {
        try {
          const detected = detectFields();
          sendResponse({ ok: true, count: detected.length });
        } catch (err) {
          sendResponse({ ok: false, error: String(err) });
        }
        return false;
      }

      if (message.type === "PING") {
        sendResponse({ ok: true, pong: true });
        return false;
      }

      return false;
    }
  );

  console.log("[SFF] content script listener registered");
}

// Register listener exactly once per isolated world.
if (!(window as any)[GLOBAL_FLAG]) {
  (window as any)[GLOBAL_FLAG] = true;
  init();
} else {
  console.log("[SFF] content script already loaded, skipping re-init");
}

async function handleFill(
  profile: any,
  settings: any
): Promise<FillSummary> {
  const lang = settings?.language ?? "en";

  showProgressBar(true);
  showToast(t(lang, "detecting"), undefined, 1400);

  await new Promise((r) => setTimeout(r, 120));

  const detected = detectFields();
  const found = detected.length;

  if (found === 0) {
    showProgressBar(false);
    showToast(t(lang, "noFieldsFound"));
    return { found: 0, filled: 0, skipped: 0, failed: 0 };
  }

  const assignments = mapFieldsToProfile(detected, profile, settings);
  const skipped = found - assignments.length;
  const result = executeFill(assignments);

  showProgressBar(false);

  const summary: FillSummary = {
    found,
    filled: result.filled,
    skipped,
    failed: result.failed,
  };

  showToast(
    t(lang, "fillComplete"),
    `${t(lang, "filledFields")}: ${summary.filled} / ${summary.found}`
  );

  return summary;
}