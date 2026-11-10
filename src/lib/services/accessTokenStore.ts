/**
 * The dashboard's access token, in memory only: never written to disk or a cookie, gone when the tab closes. A new tab
 * or a reload starts without one, and backendService gets a fresh one from the httpOnly refresh cookie before the
 * first request.
 */
let accessToken: string | undefined;

export const accessTokenStore = {
  get: () => accessToken,
  set: (token: string) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = undefined;
  },
};
