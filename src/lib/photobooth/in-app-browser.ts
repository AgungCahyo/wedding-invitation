/** Common in-app browsers that often block getUserMedia. */
export function isInAppBrowser(ua = typeof navigator === "undefined" ? "" : navigator.userAgent) {
  return /FBAN|FBAV|Instagram|Line\/|Twitter|TikTok|Bytedance|Snapchat|WhatsApp|Messenger/i.test(
    ua
  );
}

/** Best-effort: open the current page in Chrome on Android. iOS in-app browsers usually ignore this. */
export function tryOpenExternalBrowser() {
  if (typeof window === "undefined") return;
  const { host, pathname, search, hash, href, protocol } = window.location;
  if (protocol !== "https:" && protocol !== "http:") return;
  if (/Android/i.test(navigator.userAgent)) {
    const scheme = protocol.replace(":", "");
    window.location.href = `intent://${host}${pathname}${search}${hash}#Intent;scheme=${scheme};package=com.android.chrome;end`;
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}
