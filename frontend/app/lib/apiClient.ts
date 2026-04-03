import createClient from "openapi-fetch";
import type { paths } from "../../src/lib/api/schema";

export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  signal: AbortSignal.timeout(10000),
});
