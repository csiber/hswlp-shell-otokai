import type { Route } from "next"

export const SITE_NAME = "HSWLP:Next"
export const SITE_DESCRIPTION =
  "Hybrid Service Workflow Launch Platform"
export const SITE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://hswlp-shell-otokai.promnet.workers.dev/"
export const GITHUB_REPO_URL = "https://github.com/csiber/hswlp-shell-otokai"

export const SITE_DOMAIN = new URL(SITE_URL).hostname
export const PASSWORD_RESET_TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60 // 24 hours
export const EMAIL_VERIFICATION_TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60 // 24 hours
export const MAX_SESSIONS_PER_USER = 5;
export const SESSION_COOKIE_NAME = "session";

export const REDIRECT_AFTER_SIGN_IN = "/dashboard" as Route;
