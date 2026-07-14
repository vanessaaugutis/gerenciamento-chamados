import { API_URL, authenticatedFetch } from './auth';


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
  const response = await authenticatedFetch(`${API_URL}/tickets/dashboard`);

  if (!response.ok) {
    throw new Error('Erro ao carregar o dashboard');
  }

  return response.json();
}
