export interface SiteConfig {
  baseUrl: string;
  apiKey: string;
  name: string;
  apiKeyHeader: string;
  apiVersion?: string;
  /** Optional custom path for orders (e.g. '/api/orders/api-key') */
  orderPath?: string;
  /** Optional base URL for images if different from API base URL */
  imageBaseUrl?: string;
}

export const sites: Record<string, SiteConfig> = {
  site1: {
    name: "Style Hub",
    baseUrl: "https://backend-xi-murex-46.vercel.app",
    apiKey: "sk_test_stylehub_ai_integration_key_2024",
    apiKeyHeader: "X-API-Key",
    apiVersion: "external",
    orderPath: "/api/external/orders",
    imageBaseUrl: "https://stylehub-showcase.vercel.app"
  },
  site2: {
    name: "LuxeWear",
    baseUrl: "https://style-suite-express.vercel.app",
    apiKey: "37d07e0a2a290644cf9c3e731462128e741abda974c3ae882367c483893b521a",
    apiKeyHeader: "x-api-key",
    apiVersion: "v1"
    ,
    orderPath: "/api/v1/orders"
  }
};

export type SiteId = keyof typeof sites;