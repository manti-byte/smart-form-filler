const HOST_ID = "sff-overlay-host";

let host: HTMLDivElement | null = null;
let shadow: ShadowRoot | null = null;
let toastEl: HTMLDivElement | null = null;
let toastTimer: number | null = null;

function ensureHost(): ShadowRoot {
  if (shadow) return shadow;
  host = document.createElement("div");
  host.id = HOST_ID;
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.right = "0";
  host.style.zIndex = "2147483647";
  host.style.pointerEvents = "none";
  document.documentElement.appendChild(host);
  shadow = host.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    .sff-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 320px;
      background: #17142b;
      color: #e8e5f5;
      border: 1px solid #2a2547;
      border-radius: 12px;
      padding: 14px 18px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      pointer-events: none;
      opacity: 0;
      transform: translateY(-8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .sff-toast.sff-show {
      opacity: 1;
      transform: translateY(0);
    }
    .sff-toast-title { font-weight: 600; margin-bottom: 4px; }
    .sff-toast-body { color: #a49fc4; }
    .sff-progress {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #8b5cf6, #a78bfa);
      transform-origin: left;
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    .sff-progress.sff-active { transform: scaleX(1); }
  `;
  shadow.appendChild(style);

  toastEl = document.createElement("div");
  toastEl.className = "sff-toast";
  shadow.appendChild(toastEl);

  return shadow;
}

export function showToast(title: string, body?: string, durationMs = 3000): void {
  const root = ensureHost();
  if (!toastEl) return;
  toastEl.innerHTML = "";
  const titleEl = document.createElement("div");
  titleEl.className = "sff-toast-title";
  titleEl.textContent = title;
  toastEl.appendChild(titleEl);
  if (body) {
    const bodyEl = document.createElement("div");
    bodyEl.className = "sff-toast-body";
    bodyEl.textContent = body;
    toastEl.appendChild(bodyEl);
  }
  // force reflow so the transition triggers
  void toastEl.offsetWidth;
  toastEl.classList.add("sff-show");
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl?.classList.remove("sff-show");
  }, durationMs);
  // keep the shadow root alive but unused after
  void root;
}

export function showProgressBar(active: boolean): void {
  if (!shadow) ensureHost();
  if (!shadow) return;
  let bar = shadow.querySelector<HTMLDivElement>(".sff-progress");
  if (!bar) {
    bar = document.createElement("div");
    bar.className = "sff-progress";
    shadow.appendChild(bar);
  }
  bar.classList.toggle("sff-active", active);
}

export function removeOverlay(): void {
  if (host?.parentNode) host.parentNode.removeChild(host);
  host = null;
  shadow = null;
  toastEl = null;
}