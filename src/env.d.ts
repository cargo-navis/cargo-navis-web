// Required env vars: next.config.mjs refuses to start without them, so they are always strings.
declare namespace NodeJS {
  interface ProcessEnv {
    /** Allowed values are checked in next.config.mjs. */
    PROJECT_ENV: 'local' | 'dev' | 'production';
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_BACKEND_URL: string;
    /** Web push public key (dashboard and driver portal). */
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: string;
  }
}
