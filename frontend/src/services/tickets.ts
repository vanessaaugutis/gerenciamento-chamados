import { authHeaders } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type Ticket = {
  id: number;
  subject: string;
  description: string;
  priority: string;
  status: string;
  createdAt?: string;
  dueDate?: string;
  category?: { id: number; name: string };
  responsible?: { id: number; name: string };
  requester?: { id: number; name: string };
  categoryId?: number;
  responsibleId?: number;
  requesterId?: number;
  comments?: Comment[];
  histories?: HistoryItem[];
};

export type Comment = {
  id: number;
  text: string;
  createdAt?: string;
  user?: { id: number; name: string };
};

export type HistoryItem = {
  id: number;
  change: string;
  createdAt?: string;
  user?: { id: number; name: string };
};

export type TicketListParams = {
  subject?: string;
  requester?: string;
  categoryId?: string;
  priority?: string;
  status?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
};

export type TicketListResponse = {
  items: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.message)) return data.message.join(', ');
  } catch {}
  return response.statusText || 'Erro inesperado';
}

export async function listTickets(params: TicketListParams = {}): Promise<TicketListResponse> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, String(value));
    }
  });

  const response = await fetch(`${API_URL}/tickets?${query.toString()}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Erro ao listar chamados');
  }
  return response.json();
}

export async function createTicket(payload: Record<string, unknown>): Promise<Ticket> {
  const response = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function updateTicket(id: number, payload: Record<string, unknown>): Promise<Ticket> {
  const response = await fetch(`${API_URL}/tickets/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function deleteTicket(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/tickets/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

export async function getTicketDetails(id: number): Promise<Ticket> {
  const response = await fetch(`${API_URL}/tickets/${id}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar detalhes do chamado');
  }
  return response.json();
}

export async function createComment(ticketId: number, payload: { text: string }): Promise<Comment> {
  const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}
