import type { BgMessage } from "./types";

export interface BgResponse<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

export function sendToBackground<T = unknown>(
  message: BgMessage
): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response) {
        reject(new Error("Empty response from background"));
        return;
      }
      if (!response.ok) {
        reject(new Error(response.error || "Background error"));
        return;
      }
      resolve(response as T);
    });
  });
}

export function sendToTab<T = unknown>(
  tabId: number,
  message: unknown
): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response as T);
    });
  });
}