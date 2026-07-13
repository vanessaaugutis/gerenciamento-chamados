import { authHeaders } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type UserSummary = {
  id: number;
  name: string;
  email: string;
};

export async function listUsers(): Promise<UserSummary[]> {
  const response = await fetch(`${API_URL}/users`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao listar usuários');
  }

  return response.json();
}
