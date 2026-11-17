import type { ExtensionSettings, FillSummary, Profile, RegionCode, GenderMode } from "@shared/types";
import { t } from "@shared/i18n";
import type { Lang } from "@shared/i18n";

interface Props {
  lang: Lang;
  profile: Profile | null;
  settings: ExtensionSettings;
  loading: boolean;
  summary: FillSummary | null;
  detectedCount: number | null;
  apiFallback: boolean;
  onFill: () => void;
  onGenerate: () => void;
  onClear: () => void;
  onOpenEditor: () => void;
  onCopy: (text: string) => void;
  onRegionChange: (r: RegionCode) => void;
  onGenderChange: (g: GenderMode) => void;
  onSettingsChange: (s: ExtensionSettings) => void;
}

const REGIONS: { value: RegionCode; label: string }[] = [
  { value: "random", label: "Random" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "NL", label: "Netherlands" },
  { value: "RU", label: "Russia" },
  { value: "PL", label: "Poland" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
];

const PROFILE_FIELDS: { key: keyof Profile; labelKey: string }[] = [
  { key: "fullName", labelKey: "fullName" },
  { key: "email", labelKey: "email" },
  { key: "phone", labelKey: "phone" },
  { key: "address", labelKey: "address" },
  { key: "city", labelKey: "city" },
  { key: "country", labelKey: "country" },
];

export default function MainScreen({
  lang, profile, settings, loading, summary, detectedCount, apiFallback,
  onFill, onGenerate, onClear, onOpenEditor, onCopy,
  onRegionChange, onGenderChange, onSettingsChange,
}: Props) {
  const handleRegion = (r: RegionCode) => {
    onRegionChange(r);
    onSettingsChange({ ...settings, region: r });
  };
  const handleGender = (g: GenderMode) => {
    onGenderChange(g);
    onSettingsChange({ ...settings, genderMode: g });
  };

  return (
    <main className="main-screen">
      <div className="controls-row">
        <select
          className="select select-sm"
          value={settings.region}
          onChange={(e) => handleRegion(e.target.value as RegionCode)}
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <select
          className="select select-sm"
          value={settings.genderMode}
          onChange={(e) => handleGender(e.target.value as GenderMode)}
        >
          <option value="random">{t(lang, "random")}</option>
          <option value="male">{t(lang, "male")}</option>
          <option value="female">{t(lang, "female")}</option>
        </select>
      </div>

      <div className="action-row">
        <button className="btn btn-primary" onClick={onFill} disabled={loading}>
          {loading ? <span className="spinner spinner-sm" /> : <span>⚡</span>}
          <span>{t(lang, "fill")}</span>
        </button>
        <button className="btn btn-secondary" onClick={onGenerate} disabled={loading}>
          <span>↻</span>
          <span>{t(lang, "generate")}</span>
        </button>
      </div>

      {detectedCount !== null && !summary && (
        <div className="notice notice-info">
          {t(lang, "foundFields")}: {detectedCount}
        </div>
      )}

      {apiFallback && <div className="notice notice-warn">{t(lang, "apiError")}</div>}

      <section className="profile-card">
        <div className="profile-head">
          <span className="profile-title">{t(lang, "currentProfile")}</span>
          {profile && (
            <button className="link-btn" onClick={onOpenEditor}>{t(lang, "edit")}</button>
          )}
        </div>
        {!profile ? (
          <p className="muted">{t(lang, "noProfile")}</p>
        ) : (
          <ul className="profile-list">
            {PROFILE_FIELDS.map((f) => (
              <li key={f.key} className="profile-row">
                <span className="profile-label">{t(lang, f.labelKey)}</span>
                <span className="profile-value" title={profile[f.key] as string}>
                  {profile[f.key] as string}
                </span>
                <button
                  className="copy-btn"
                  onClick={() => onCopy(profile[f.key] as string)}
                  aria-label={t(lang, "copy")}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {summary && (
        <section className="summary-card">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-num">{summary.found}</span>
              <span className="summary-label">{t(lang, "foundFields")}</span>
            </div>
            <div className="summary-item summary-success">
              <span className="summary-num">{summary.filled}</span>
              <span className="summary-label">{t(lang, "filledFields")}</span>
            </div>
            <div className="summary-item">
              <span className="summary-num">{summary.skipped}</span>
              <span className="summary-label">{t(lang, "skippedFields")}</span>
            </div>
            <div className="summary-item summary-danger">
              <span className="summary-num">{summary.failed}</span>
              <span className="summary-label">{t(lang, "failedFields")}</span>
            </div>
          </div>
        </section>
      )}

      <div className="bottom-row">
        <button className="btn btn-ghost" onClick={onClear} disabled={loading}>
          {t(lang, "clear")}
        </button>
      </div>
    </main>
  );
}