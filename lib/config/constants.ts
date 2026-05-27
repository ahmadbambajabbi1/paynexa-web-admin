/** Base URL of admin-service (no trailing slash). */
const rawAdminApiBaseUrl =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ??
  "https://paynexa-admin-service-production.up.railway.app";

export const ADMIN_API_BASE_URL = rawAdminApiBaseUrl
  .replace(/\/$/, "")
  .replace(/^(?!https?:\/\/)/, "https://");

export const STORAGE_ADMIN_ACCESS_TOKEN = "escrow_admin_access_token";
