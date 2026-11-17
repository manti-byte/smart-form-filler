import type { DetectedField, FieldType } from "@shared/types";
import { FIELD_PATTERNS, ATTRIBUTE_KEYS } from "@shared/field-patterns";

const IGNORED_TYPES = new Set([
  "hidden",
  "submit",
  "button",
  "reset",
  "image",
  "file",
  "color",
  "range",
]);

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (style.opacity === "0") return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  return true;
}

function isFillable(el: Element): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  if (el instanceof HTMLInputElement) {
    if (IGNORED_TYPES.has(el.type)) return false;
    if (el.readOnly || el.disabled) return false;
  } else if (el instanceof HTMLTextAreaElement) {
    if (el.readOnly || el.disabled) return false;
  } else if (el instanceof HTMLSelectElement) {
    if (el.disabled) return false;
  } else {
    return false;
  }
  return isVisible(el);
}

function getLabelText(el: Element): string {
  // 1. for= association
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    if (el.id) {
      const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (label?.textContent) return label.textContent.trim();
    }
  }
  // 2. wrapper label
  const wrapper = el.closest("label");
  if (wrapper?.textContent) {
    const clone = wrapper.cloneNode(true) as HTMLElement;
    // remove the input itself so its value doesn't pollute the label text
    clone.querySelectorAll("input, select, textarea").forEach((n) => n.remove());
    const txt = clone.textContent?.trim();
    if (txt) return txt;
  }
  // 3. aria-labelledby
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const parts = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
      .filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  return "";
}

function getNearbyText(el: Element): string {
  // Previous sibling text, then parent's preceding text — enough for
  // "First Name" sitting in a <span> above the input.
  const prev = el.previousElementSibling;
  if (prev?.textContent) {
    const txt = prev.textContent.trim();
    if (txt.length > 0 && txt.length < 40) return txt;
  }
  const parent = el.parentElement;
  if (parent) {
    const clone = parent.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("input, select, textarea, button").forEach((n) => n.remove());
    const txt = clone.textContent?.trim() ?? "";
    if (txt.length > 0 && txt.length < 60) return txt;
  }
  return "";
}

function collectSignals(el: Element): { source: string; value: string }[] {
  const signals: { source: string; value: string }[] = [];

  for (const key of ATTRIBUTE_KEYS) {
    const value = el.getAttribute(key);
    if (value) signals.push({ source: key, value });
  }

  if (el instanceof HTMLInputElement && el.type) {
    signals.push({ source: "type", value: el.type });
  }

  const labelText = getLabelText(el);
  if (labelText) signals.push({ source: "label", value: labelText });

  const nearby = getNearbyText(el);
  if (nearby) signals.push({ source: "nearby", value: nearby });

  return signals;
}

interface ScoreResult {
  fieldType: FieldType;
  confidence: number;
  descriptor: string;
}

function scoreElement(el: Element): ScoreResult | null {
  const signals = collectSignals(el);
  if (signals.length === 0) return null;

  const type = el instanceof HTMLInputElement ? el.getAttribute("type") : null;
  const autocomplete = el.getAttribute("autocomplete");

  let best: ScoreResult | null = null;

  for (const pattern of FIELD_PATTERNS) {
    let score = 0;
    let matchedDescriptor = "";

    // Strong: input type match
    if (type && pattern.inputTypes?.includes(type)) {
      score += pattern.weight;
      matchedDescriptor = `type=${type}`;
    }

    // Strong: autocomplete token match
    if (autocomplete && pattern.inputTypes?.includes(autocomplete)) {
      score += pattern.weight;
      matchedDescriptor = `autocomplete=${autocomplete}`;
    }

    // Attribute / label / nearby text matches
    for (const signal of signals) {
      if (signal.source === "type") continue;
      for (const re of pattern.patterns) {
        if (re.test(signal.value)) {
          // autocomplete / name / id are more reliable than nearby text
          const sourceWeight =
            signal.source === "autocomplete" || signal.source === "name" || signal.source === "id"
              ? 1
              : signal.source === "placeholder" || signal.source === "aria-label" || signal.source === "label"
              ? 0.8
              : 0.5;
          score += pattern.weight * sourceWeight;
          if (!matchedDescriptor) matchedDescriptor = `${signal.source}=${signal.value}`;
          break; // one match per signal is enough
        }
      }
    }

    if (score > 0 && (!best || score > best.confidence)) {
      best = { fieldType: pattern.type, confidence: score, descriptor: matchedDescriptor };
    }
  }

  if (!best) return null;
  return best;
}

export function detectFields(
  root: ParentNode = document
): DetectedField[] {
  const candidates = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    "input, textarea, select"
  );

  const detected: DetectedField[] = [];

  for (const el of Array.from(candidates)) {
    if (!isFillable(el)) continue;
    const scored = scoreElement(el);
    if (!scored) continue;
    detected.push({
      element: el,
      fieldType: scored.fieldType,
      confidence: scored.confidence,
      descriptor: scored.descriptor,
    });
  }

  return detected;
}