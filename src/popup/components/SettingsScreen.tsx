import { useState } from "react";
import type { ExtensionSettings, FieldType, ThemeId } from "@shared/types";
import { DEFAULT_SETTINGS } from "@shared/types";
import { t } from "@shared/i18n";
import type { Lang } from "@shared/i18n";
import { THEMES } from "@shared/themes";
import Toggle from "./Toggle";

interface Props {
  lang: Lang;
  settings: ExtensionSettings;
  onChange: (s: ExtensionSettings) => void;
}

const FIELD_KEYS: FieldType[] = [
  "firstName", "lastName", "fullName", "username", "email", "phone",
  "address", "city", "state", "country", "zip", "company", "jobTitle",
  "dob", "gender", "password", "website", "creditCard",
];

const LABEL_MAP: Record<FieldType, string> = {
  firstName: "firstName", lastName: "lastName", fullName: "fullName",
  username: "username", email: "email", phone: "phone", address: "address",
  city: "city", state: "state", country: "country", zip: "zip",
  company: "company", jobTitle: "jobTitle", dob: "dob", gender: "gender",
  password: "password", website: "website", creditCard: "creditCard",
};

export default function SettingsScreen({ lang, settings, onChange }: Props) {
  const [tab, setTab] = useState<"fields" | "appearance" | "custom">("fields");

  const setField = (key: FieldType, value: boolean) => {
    onChange({
      ...settings,
      enabledFields: { ...settings.enabledFields, [key]: value },
    });
  };

  const setAll = (value: boolean) => {
    const next = { ...settings.enabledFields };
    for (const k of FIELD_KEYS) next[k] = value;
    onChange({ ...settings, enabledFields: next });
  };

  const resetDefaults = () => {
    onChange({ ...settings, enabledFields: { ...DEFAULT_SETTINGS.enabledFields } });
  };

  return (
    <main className="settings-screen">
      <div className="tab-bar">
        <button className={tab === "fields" ? "tab active" : "tab"} onClick={() => setTab("fields")}>
          {t(lang, "fields")}
        </button>
        <button className={tab === "appearance" ? "tab active" : "tab"} onClick={() => setTab("appearance")}>
          {t(lang, "theme")}
        </button>
        <button className={tab === "custom" ? "tab active" : "tab"} onClick={() => setTab("custom")}>
          {t(lang, "customFields")}
        </button>
      </div>

      {tab === "fields" && (
        <>
          <div className="settings-actions">
            <button className="link-btn" onClick={() => setAll(true)}>{t(lang, "selectAll")}</button>
            <button className="link-btn" onClick={() => setAll(false)}>{t(lang, "deselectAll")}</button>
            <button className="link-btn" onClick={resetDefaults}>{t(lang, "resetDefault")}</button>
          </div>
          <ul className="toggle-list">
            {FIELD_KEYS.map((key) => (
              <li key={key} className="toggle-row">
                <span>{t(lang, LABEL_MAP[key])}</span>
                <Toggle
                  checked={settings.enabledFields[key]}
                  onChange={(v) => setField(key, v)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === "appearance" && (
        <div className="appearance-pane">
          <div className="setting-group">
            <label className="setting-label">{t(lang, "language")}</label>
            <select
              className="select"
              value={settings.language}
              onChange={(e) => onChange({ ...settings, language: e.target.value as Lang })}
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-label">{t(lang, "theme")}</label>
            <div className="theme-grid">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  className={settings.theme === th.id ? "theme-tile active" : "theme-tile"}
                  onClick={() => onChange({ ...settings, theme: th.id as ThemeId })}
                >
                  <div className="theme-preview" style={{ background: th.vars["--bg"] }}>
                    <div className="theme-preview-surface" style={{ background: th.vars["--surface"] }} />
                    <div className="theme-preview-accent" style={{ background: th.vars["--accent"] }} />
                  </div>
                  <span className="theme-name">{th.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "custom" && (
        <div className="appearance-pane">
          <p className="muted">{t(lang, "customFields")}</p>
          <CustomRulesEditor lang={lang} settings={settings} onChange={onChange} />
        </div>
      )}
    </main>
  );
}

function CustomRulesEditor({ lang, settings, onChange }: Props) {
  const addRule = () => {
    onChange({
      ...settings,
      customRules: [
        ...settings.customRules,
        { id: crypto.randomUUID(), matchOn: "name", matchValue: "", mapsTo: "username" },
      ],
    });
  };
  const updateRule = (id: string, patch: Partial<typeof settings.customRules[number]>) => {
    onChange({
      ...settings,
      customRules: settings.customRules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  };
  const removeRule = (id: string) => {
    onChange({ ...settings, customRules: settings.customRules.filter((r) => r.id !== id) });
  };

  return (
    <div className="rules-editor">
      {settings.customRules.map((r) => (
        <div key={r.id} className="rule-row">
          <select
            className="select select-xs"
            value={r.matchOn}
            onChange={(e) => updateRule(r.id, { matchOn: e.target.value as any })}
          >
            <option value="name">name</option>
            <option value="id">id</option>
            <option value="placeholder">placeholder</option>
          </select>
          <input
            className="input input-xs"
            value={r.matchValue}
            placeholder="value"
            onChange={(e) => updateRule(r.id, { matchValue: e.target.value })}
          />
          <select
            className="select select-xs"
            value={r.mapsTo}
            onChange={(e) => updateRule(r.id, { mapsTo: e.target.value as any })}
          >
            {FIELD_KEYS.map((k) => (
              <option key={k} value={k}>{t(lang, LABEL_MAP[k])}</option>
            ))}
            <option value="randomId">Random ID</option>
            <option value="randomNumber">Random Number</option>
          </select>
          <button className="icon-btn icon-btn-sm" onClick={() => removeRule(r.id)}>×</button>
        </div>
      ))}
      <button className="btn btn-secondary btn-sm" onClick={addRule}>
        + {t(lang, "addRule")}
      </button>
    </div>
  );
}