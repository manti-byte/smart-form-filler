import { useState } from "react";
import type { Profile } from "@shared/types";
import { t } from "@shared/i18n";
import type { Lang } from "@shared/i18n";

interface Props {
  lang: Lang;
  profile: Profile;
  onSave: (p: Profile) => void;
  onCancel: () => void;
}

const FIELDS: { key: keyof Profile; labelKey: string }[] = [
  { key: "firstName", labelKey: "firstName" },
  { key: "lastName", labelKey: "lastName" },
  { key: "fullName", labelKey: "fullName" },
  { key: "username", labelKey: "username" },
  { key: "email", labelKey: "email" },
  { key: "phone", labelKey: "phone" },
  { key: "address", labelKey: "address" },
  { key: "city", labelKey: "city" },
  { key: "state", labelKey: "state" },
  { key: "country", labelKey: "country" },
  { key: "zip", labelKey: "zip" },
  { key: "company", labelKey: "company" },
  { key: "jobTitle", labelKey: "jobTitle" },
  { key: "dob", labelKey: "dob" },
  { key: "password", labelKey: "password" },
  { key: "website", labelKey: "website" },
];

export default function ProfileEditor({ lang, profile, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<Profile>(profile);
  return (
    <main className="editor-screen">
      <ul className="editor-list">
        {FIELDS.map((f) => (
          <li key={f.key} className="editor-row">
            <label className="editor-label">{t(lang, f.labelKey)}</label>
            <input
              className="input input-sm"
              value={draft[f.key] as string}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            />
          </li>
        ))}
      </ul>
      <div className="editor-actions">
        <button className="btn btn-primary" onClick={() => onSave(draft)}>{t(lang, "save")}</button>
        <button className="btn btn-ghost" onClick={onCancel}>{t(lang, "cancel")}</button>
      </div>
    </main>
  );
}