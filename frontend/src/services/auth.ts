const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

/** Returns headers with Authorization Bearer token included. */
export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}
