import { API_URL, authenticatedFetch } from './auth';


export type UserSummary = {
  id: number;
  name: string;
  email: string;
};

export async function listUsers(): Promise<UserSummary[]> {
  const response = await authenticatedFetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error('Erro ao listar usuários');
  }

  return response.json();
}
