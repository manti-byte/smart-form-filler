import type { ThemeDef, ThemeId } from "./types";

export const THEMES: ThemeDef[] = [
  {
    id: "midnight",
    name: "Midnight",
    vars: {
      "--bg": "#0d0b1a",
      "--surface": "#17142b",
      "--surface-2": "#1f1b38",
      "--border": "#2a2547",
      "--text": "#e8e5f5",
      "--text-dim": "#a49fc4",
      "--accent": "#8b5cf6",
      "--accent-hover": "#a78bfa",
      "--accent-text": "#ffffff",
      "--success": "#34d399",
      "--danger": "#f87171",
      "--warning": "#fbbf24",
    },
  },
  {
    id: "nord",
    name: "Nord",
    vars: {
      "--bg": "#2e3440",
      "--surface": "#3b4252",
      "--surface-2": "#434c5e",
      "--border": "#4c566a",
      "--text": "#eceff4",
      "--text-dim": "#a3abb8",
      "--accent": "#88c0d0",
      "--accent-hover": "#8fbcbb",
      "--accent-text": "#2e3440",
      "--success": "#a3be8c",
      "--danger": "#bf616a",
      "--warning": "#ebcb8b",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    vars: {
      "--bg": "#282a36",
      "--surface": "#343746",
      "--surface-2": "#3e4152",
      "--border": "#4a4d5e",
      "--text": "#f8f8f2",
      "--text-dim": "#b0b3c0",
      "--accent": "#bd93f9",
      "--accent-hover": "#caa9fa",
      "--accent-text": "#282a36",
      "--success": "#50fa7b",
      "--danger": "#ff5555",
      "--warning": "#f1fa8c",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    vars: {
      "--bg": "#0a1929",
      "--surface": "#0f2a44",
      "--surface-2": "#143a5c",
      "--border": "#1e4d78",
      "--text": "#e0f2fe",
      "--text-dim": "#7fb3d5",
      "--accent": "#22d3ee",
      "--accent-hover": "#67e8f9",
      "--accent-text": "#0a1929",
      "--success": "#2dd4bf",
      "--danger": "#f87171",
      "--warning": "#fde047",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    vars: {
      "--bg": "#0a1f14",
      "--surface": "#0f2e1e",
      "--surface-2": "#153d28",
      "--border": "#1f5236",
      "--text": "#d1fae5",
      "--text-dim": "#6ee7b7",
      "--accent": "#10b981",
      "--accent-hover": "#34d399",
      "--accent-text": "#0a1f14",
      "--success": "#34d399",
      "--danger": "#f87171",
      "--warning": "#fbbf24",
    },
  },
  {
    id: "light",
    name: "Light",
    vars: {
      "--bg": "#f8fafc",
      "--surface": "#ffffff",
      "--surface-2": "#f1f5f9",
      "--border": "#e2e8f0",
      "--text": "#0f172a",
      "--text-dim": "#64748b",
      "--accent": "#6366f1",
      "--accent-hover": "#4f46e5",
      "--accent-text": "#ffffff",
      "--success": "#10b981",
      "--danger": "#ef4444",
      "--warning": "#f59e0b",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    vars: {
      "--bg": "#0a0a0f",
      "--surface": "#12121a",
      "--surface-2": "#1a1a26",
      "--border": "#2a2a3a",
      "--text": "#e0e0f0",
      "--text-dim": "#8888aa",
      "--accent": "#ff2a6d",
      "--accent-hover": "#ff5a8d",
      "--accent-text": "#ffffff",
      "--success": "#05ffa1",
      "--danger": "#ff2a6d",
      "--warning": "#f9f002",
    },
  },
];

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyTheme(id: ThemeId): void {
  const theme = getTheme(id);
  const root = document.documentElement;
  for (const [key, val] of Object.entries(theme.vars)) {
    root.style.setProperty(key, val);
  }
  root.dataset.theme = id;
}