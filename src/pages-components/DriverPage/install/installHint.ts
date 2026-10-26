/** sessionStorage key: the driver chose "Nastavi u pregledniku" in this tab, so the gate turns into a card. */
export const CONTINUE_IN_BROWSER_KEY = 'driver-continue-in-browser';

/**
 * `gate`: full-screen install screen (phone browser). `card`: compact reminder after continuing in the browser.
 * `none`: installed app or desktop.
 */
export type InstallPromptMode = 'none' | 'gate' | 'card';

/** Which install instructions fit the current browser. */
export type InstallPlatform = 'prompt' | 'installed' | 'ios-safari' | 'ios-other' | 'android-other';

export function isIos(userAgent: string) {
  return /iPhone|iPad|iPod/.test(userAgent);
}

function isPhone(userAgent: string) {
  return isIos(userAgent) || /Android/.test(userAgent);
}

export function getInstallPromptMode({
  userAgent,
  isStandalone,
  continuedInBrowser,
}: {
  userAgent: string;
  isStandalone: boolean;
  continuedInBrowser: boolean;
}): InstallPromptMode {
  if (isStandalone || !isPhone(userAgent)) return 'none';
  return continuedInBrowser ? 'card' : 'gate';
}

export function getInstallPlatform({
  userAgent,
  canPromptInstall,
  isInstalled,
}: {
  userAgent: string;
  canPromptInstall: boolean;
  isInstalled: boolean;
}): InstallPlatform {
  if (isInstalled) return 'installed';
  if (canPromptInstall) return 'prompt';
  if (isIos(userAgent)) {
    // Only Safari adds web apps to the home screen reliably; Chrome/Firefox/Edge/Opera and in-app browsers
    // (which drop the "Safari/" token) are sent to Safari.
    const isSafari = /Safari\//.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
    return isSafari ? 'ios-safari' : 'ios-other';
  }
  return 'android-other';
}
