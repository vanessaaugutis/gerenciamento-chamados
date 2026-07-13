const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type Category = {
  id: number;
  name: string;
  description?: string;
};

export async function listCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) {
    throw new Error('Erro ao listar categorias');
  }
  return response.json();
}

export async function createCategory(payload: { name: string; description?: string }): Promise<Category> {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar categoria');
  }

  return response.json();
}

export async function updateCategory(id: number, payload: { name?: string; description?: string }): Promise<Category> {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar categoria');
  }

  return response.json();
}

export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir categoria');
  }
}
