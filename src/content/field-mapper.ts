import type {
  CustomFieldRule,
  DetectedField,
  ExtensionSettings,
  FieldType,
  Profile,
} from "@shared/types";

export interface FillAssignment {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  fieldType: FieldType;
  value: string;
}

function randDigits(n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function applyCustomRules(
  el: HTMLElement,
  rules: CustomFieldRule[]
): string | null {
  for (const rule of rules) {
    const raw = el.getAttribute(rule.matchOn) ?? "";
    if (raw && raw.includes(rule.matchValue)) {
      if (rule.mapsTo === "randomId") return randDigits(8);
      if (rule.mapsTo === "randomNumber") return String(Math.floor(Math.random() * 1000000));
      // mapsTo is a FieldType — caller resolves the actual profile value
      return `__field__:${rule.mapsTo}`;
    }
  }
  return null;
}

/**
 * Assign a Profile value to each detected field, respecting
 * enabledFields toggles and custom rules.
 * Fields whose type is disabled in settings are dropped (counted as skipped by caller).
 */
export function mapFieldsToProfile(
  detected: DetectedField[],
  profile: Profile,
  settings: ExtensionSettings
): FillAssignment[] {
  const assignments: FillAssignment[] = [];

  for (const field of detected) {
    let value: string | null = null;
    let effectiveType: FieldType = field.fieldType;

    const custom = applyCustomRules(field.element, settings.customRules);
    if (custom !== null) {
      if (custom.startsWith("__field__:")) {
        const mapped = custom.slice("__field__:".length) as FieldType;
        if (!settings.enabledFields[mapped]) continue;
        effectiveType = mapped;
        value = profile[mapped] as string;
      } else {
        value = custom;
      }
    } else {
      if (!settings.enabledFields[field.fieldType]) continue;
      value = profile[field.fieldType] as string;
    }

    if (value == null || value === "") continue;

    assignments.push({
      element: field.element,
      fieldType: effectiveType,
      value,
    });
  }

  return assignments;
}