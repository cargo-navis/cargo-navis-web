import { useEffect, useState } from 'react';

import {
  CONTINUE_IN_BROWSER_KEY,
  getInstallPlatform,
  getInstallPromptMode,
  type InstallPlatform,
  type InstallPromptMode,
} from './installHint';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Chrome can fire beforeinstallprompt before React mounts, so the event is captured as soon as this module loads.
let installPrompt: BeforeInstallPromptEvent | null = null;
let isInstalled = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Keep Chrome's own mini-infobar away; the gate offers the install instead.
    event.preventDefault();
    installPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    isInstalled = true;
    notify();
  });
}

/** True inside the app added to the home screen. */
export function isInstalledApp() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function readContinuedInBrowser() {
  try {
    return sessionStorage.getItem(CONTINUE_IN_BROWSER_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useInstallPrompt(): {
  mode: InstallPromptMode;
  platform: InstallPlatform;
  install(): Promise<void>;
  continueInBrowser(): void;
} {
  // Starts as 'none' so server and first client render match; the effect decides right after hydration.
  const [state, setState] = useState<{ mode: InstallPromptMode; platform: InstallPlatform }>({
    mode: 'none',
    platform: 'android-other',
  });

  useEffect(() => {
    function update() {
      const { userAgent } = navigator;
      setState({
        mode: getInstallPromptMode({
          userAgent,
          isStandalone: isInstalledApp(),
          continuedInBrowser: readContinuedInBrowser(),
        }),
        platform: getInstallPlatform({ userAgent, canPromptInstall: installPrompt !== null, isInstalled }),
      });
    }

    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  async function install() {
    const prompt = installPrompt;
    if (!prompt) return;
    // A prompt can only be shown once; clearing it first also ignores a second tap while the dialog is open.
    installPrompt = null;
    await prompt.prompt();
    await prompt.userChoice;
    notify();
  }

  function continueInBrowser() {
    try {
      sessionStorage.setItem(CONTINUE_IN_BROWSER_KEY, 'true');
    } catch {
      // Private mode without storage: the choice just lasts until the next render.
    }
    setState((current) => ({ ...current, mode: 'card' }));
  }

  return { ...state, install, continueInBrowser };
}
