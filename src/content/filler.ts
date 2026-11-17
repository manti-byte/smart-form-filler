import type { FillAssignment } from "./field-mapper";

/**
 * Set a value on an input/textarea the way React/Vue/Angular expect.
 * Bypasses the framework's value property override by reaching
 * the native prototype setter, then fires the synthetic events.
 */
function nativeSetValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }
}

function dispatch(el: Element, type: string): void {
  el.dispatchEvent(
    new Event(type, { bubbles: true, cancelable: true, composed: true })
  );
}

function fillInput(
  el: HTMLInputElement | HTMLTextAreaElement,
  value: string
): boolean {
  el.focus();
  nativeSetValue(el, value);

  // Some frameworks listen for keydown/keyup on the element
  try {
    el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
  } catch {
    /* noop */
  }

  dispatch(el, "input");
  dispatch(el, "change");
  el.blur();
  dispatch(el, "blur");
  return el.value === value || el.value.length > 0;
}

function fillSelect(el: HTMLSelectElement, value: string): boolean {
  // Try exact option value match, then visible text, then a loose match.
  const options = Array.from(el.options);
  let match = options.find((o) => o.value === value);
  if (!match) match = options.find((o) => o.text.trim() === value);
  if (!match) {
    const lower = value.toLowerCase();
    match = options.find((o) => o.text.toLowerCase().includes(lower));
  }
  if (!match) {
    // For country/state, sometimes the field is a select of abbreviations.
    // Try first non-empty option as a sane fill.
    match = options.find((o) => o.value !== "");
  }
  if (!match) return false;

  el.focus();
  el.value = match.value;
  dispatch(el, "input");
  dispatch(el, "change");
  el.blur();
  dispatch(el, "blur");
  return true;
}

export interface FillResult {
  filled: number;
  skipped: number;
  failed: number;
}

export function executeFill(assignments: FillAssignment[]): FillResult {
  let filled = 0;
  let skipped = 0;
  let failed = 0;

  for (const a of assignments) {
    try {
      let ok = false;
      if (a.element instanceof HTMLSelectElement) {
        ok = fillSelect(a.element, a.value);
      } else {
        ok = fillInput(a.element, a.value);
      }
      if (ok) {
        filled++;
        a.element.setAttribute("data-sff-filled", "1");
        // brief highlight
        const prevOutline = a.element.style.outline;
        const prevOffset = a.element.style.outlineOffset;
        a.element.style.outline = "2px solid var(--sff-fill-color, #8b5cf6)";
        a.element.style.outlineOffset = "1px";
        setTimeout(() => {
          a.element.style.outline = prevOutline;
          a.element.style.outlineOffset = prevOffset;
        }, 600);
      } else {
        skipped++;
      }
    } catch (err) {
      console.warn("[SFF] fill failed:", a.fieldType, err);
      failed++;
    }
  }

  return { filled, skipped, failed };
}

/**
 * Clear only the fields this extension filled — never touches other fields.
 */
export function clearFilledFields(): number {
  const filled = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    "[data-sff-filled]"
  );
  let cleared = 0;
  for (const el of Array.from(filled)) {
    try {
      if (el instanceof HTMLSelectElement) {
        el.value = "";
        dispatch(el, "change");
      } else {
        nativeSetValue(el, "");
        dispatch(el, "input");
        dispatch(el, "change");
      }
      el.removeAttribute("data-sff-filled");
      cleared++;
    } catch {
      /* noop */
    }
  }
  return cleared;
}