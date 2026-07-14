export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type AuthResponse = {
  accessToken: string;
};

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data?.message)) {
      return data.message.join(', ');
    }
  } catch {}

  return response.statusText || 'Erro inesperado';
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function registerUser(name: string, email: string, password: string): Promise<void> {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/users/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as AuthResponse;
        saveToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export function saveToken(token: string) {
  localStorage.setItem('authToken', token);

  const payload = parseJwtPayload(token);
  if (payload && typeof payload.sub === 'number') {
    localStorage.setItem('authUserId', String(payload.sub));
  }
}

export function getToken(): string | null {
  return localStorage.getItem('authToken');
}

export function getUserId(): number | null {
  const raw = localStorage.getItem('authUserId');
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export function clearToken() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUserId');
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_URL}/users/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    clearToken();
  }
}

/** Fetch autenticado que renova o access token uma vez após receber 401. */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const request = (token: string | null) => {
    const headers = new Headers(init.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers, credentials: 'include' });
  };

  const response = await request(getToken());
  if (response.status !== 401) return response;

  const accessToken = await refreshAccessToken();
  if (accessToken) return request(accessToken);

  clearToken();
  window.dispatchEvent(new Event('auth:expired'));
  return response;
}
