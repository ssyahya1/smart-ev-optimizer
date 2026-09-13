//const API_URL = import.meta.env.VITE_API_URL;
const API_URL="";

let refreshRequest;

const refreshSession = () => {
  if (!refreshRequest) {
    refreshRequest = fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }).finally(() => {
      refreshRequest = undefined;
    });
  }

  return refreshRequest;
};

export async function apiRequest(endpoint, options = {}) {
  const requestOptions = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  let response = await fetch(`${API_URL}${endpoint}`, requestOptions);

  const canRefresh =
    response.status === 401 &&
    !endpoint.endsWith("/login") &&
    !endpoint.endsWith("/refresh") &&
    !endpoint.endsWith("/logout");

  if (canRefresh) {
    const refreshResponse = await refreshSession();

    if (refreshResponse.ok) {
      response = await fetch(`${API_URL}${endpoint}`, requestOptions);
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}