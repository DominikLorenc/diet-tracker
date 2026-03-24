export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
  }
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type RequestOptions<U> = {
  method?: HttpMethod;
  body?: U;
  timeoutMs?: number;
};

type ApiErrorResponse = {
  message?: string;
  code?: string;
};

function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return typeof data === "object" && data !== null && "message" in data;
}

export const apiClient = {
  _request: async <T, U = unknown>(
    url: string,
    options: RequestOptions<U> = {},
  ): Promise<T> => {
    const { method = "GET", body, timeoutMs = 10000 } = options;

    if (body && method === "GET") {
      throw new Error("GET request cannot have a body");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;

    try {
      response = await fetch(`${baseUrl}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);

      if ((error as Error).name === "AbortError") {
        throw new ApiError(0, "Request timeout");
      }

      throw new ApiError(0, "Network error");
    }

    clearTimeout(timeout);

    if (response.status === 204) {
      return null as T;
    }

    let responseData: unknown = null;

    try {
      responseData = await response.json();
    } catch {
      console.error("Failed to parse response as JSON");
    }

    if (!response.ok) {
      let message = response.statusText || "Request failed";

      if (isApiErrorResponse(responseData)) {
        message = responseData.message || message;
      }

      throw new ApiError(response.status, message, responseData);
    }

    return responseData as T;
  },

  get: <T>(url: string): Promise<T> => {
    return apiClient._request<T>(url, { method: "GET" });
  },

  post: <T, U>(url: string, body: U): Promise<T> => {
    return apiClient._request<T, U>(url, {
      method: "POST",
      body,
    });
  },

  patch: <T, U>(url: string, body: U): Promise<T> => {
    return apiClient._request<T, U>(url, {
      method: "PATCH",
      body,
    });
  },

  delete: <T>(url: string): Promise<T> => {
    return apiClient._request<T>(url, { method: "DELETE" });
  },
};
