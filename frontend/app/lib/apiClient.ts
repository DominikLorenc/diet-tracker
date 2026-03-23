export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = {
  _request: async <T, U>(
    url: string,
    method?: string,
    body?: U,
  ): Promise<T> => {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      return null as T;
    }

    const responseJson = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        "Request failed: " + responseJson.message,
      );
    }

    return responseJson as T;
  },
  get: <T>(url: string): Promise<T> => {
    return apiClient._request(`${baseUrl}${url}`, "GET");
  },
  post: <T, U>(url: string, body: U): Promise<T> => {
    return apiClient._request(`${baseUrl}${url}`, "POST", body);
  },
  patch: <T, U>(url: string, body: U): Promise<T> => {
    return apiClient._request(`${baseUrl}${url}`, "PATCH", body);
  },
  delete: <T>(url: string): Promise<T> => {
    return apiClient._request(`${baseUrl}${url}`, "DELETE");
  },
};
