import { authHeaders } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type DashboardSummary = {
  total: number;
  open: number;
  inProgress: number;
  finished: number;
  overdue: number;
  byPriority: {
    baixa: number;
    media: number;
    alta: number;
    critica: number;
  };
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch(`${API_URL}/tickets/dashboard`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar o dashboard');
  }

  return response.json();
}
