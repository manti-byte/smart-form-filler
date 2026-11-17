import type { HistoryEntry, Profile } from "@shared/types";
import { t } from "@shared/i18n";
import type { Lang } from "@shared/i18n";

interface Props {
  lang: Lang;
  history: HistoryEntry[];
  onReuse: (p: Profile) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
}

export default function HistoryScreen({ lang, history, onReuse, onDelete, onCopy }: Props) {
  if (history.length === 0) {
    return <main className="history-screen"><p className="muted">{t(lang, "historyEmpty")}</p></main>;
  }
  return (
    <main className="history-screen">
      <ul className="history-list">
        {history.map((entry) => (
          <li key={entry.id} className="history-item">
            <div className="history-main">
              <span className="history-name">{entry.profile.fullName}</span>
              <span className="history-meta">{entry.profile.email}</span>
              <span className="history-date">
                {new Date(entry.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="history-actions">
              <button className="link-btn" onClick={() => onReuse(entry.profile)}>
                {t(lang, "reuse")}
              </button>
              <button className="link-btn" onClick={() => onCopy(JSON.stringify(entry.profile, null, 2))}>
                {t(lang, "copy")}
              </button>
              <button className="link-btn danger" onClick={() => onDelete(entry.id)}>
                {t(lang, "delete")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}