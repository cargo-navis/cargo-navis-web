import { describe, expect, it } from 'vitest';

import { getInstallPlatform, getInstallPromptMode, isIos } from './installHint';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';
const IPHONE_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.0.0 Mobile/15E148 Safari/604.1';
// In-app browsers on iOS (WhatsApp, Viber, ...) usually drop the "Safari/" token.
const IPHONE_IN_APP =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36';
const DESKTOP_CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36';

describe('getInstallPromptMode', () => {
  const base = { isStandalone: false, continuedInBrowser: false };

  it('shows nothing in the installed app', () => {
    expect(getInstallPromptMode({ ...base, userAgent: IPHONE_SAFARI, isStandalone: true })).toBe('none');
  });

  it('shows nothing on desktop', () => {
    expect(getInstallPromptMode({ ...base, userAgent: DESKTOP_CHROME })).toBe('none');
  });

  it('gates a phone browser', () => {
    expect(getInstallPromptMode({ ...base, userAgent: IPHONE_SAFARI })).toBe('gate');
    expect(getInstallPromptMode({ ...base, userAgent: ANDROID_CHROME })).toBe('gate');
  });

  it('shows the card after continuing in the browser', () => {
    expect(getInstallPromptMode({ ...base, userAgent: ANDROID_CHROME, continuedInBrowser: true })).toBe('card');
  });
});

describe('getInstallPlatform', () => {
  const base = { canPromptInstall: false, isInstalled: false };

  it('uses the browser install dialog when available', () => {
    expect(getInstallPlatform({ ...base, userAgent: ANDROID_CHROME, canPromptInstall: true })).toBe('prompt');
  });

  it('says the app is installed after installing from this page', () => {
    expect(getInstallPlatform({ ...base, userAgent: ANDROID_CHROME, isInstalled: true })).toBe('installed');
  });

  it('gives Safari steps in iOS Safari', () => {
    expect(getInstallPlatform({ ...base, userAgent: IPHONE_SAFARI })).toBe('ios-safari');
  });

  it('sends other iOS browsers and in-app browsers to Safari', () => {
    expect(getInstallPlatform({ ...base, userAgent: IPHONE_CHROME })).toBe('ios-other');
    expect(getInstallPlatform({ ...base, userAgent: IPHONE_IN_APP })).toBe('ios-other');
  });

  it('gives Chrome menu steps on Android without the install dialog', () => {
    expect(getInstallPlatform({ ...base, userAgent: ANDROID_CHROME })).toBe('android-other');
  });
});

describe('isIos', () => {
  it('detects iPhones only', () => {
    expect(isIos(IPHONE_SAFARI)).toBe(true);
    expect(isIos(ANDROID_CHROME)).toBe(false);
    expect(isIos(DESKTOP_CHROME)).toBe(false);
  });
});
