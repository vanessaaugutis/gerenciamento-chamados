import { useState } from 'react';
import {
  createComment,
  getTicketDetails,
  type Comment,
  type HistoryItem,
} from '../services/tickets';
import type { ToastType } from './useToast';

type AddToast = (message: string, type?: ToastType) => void;

export function useTicketDetails(addToast: AddToast) {
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const [ticketDetails, setTicketDetails] = useState<
    Record<number, { comments: Comment[]; histories: HistoryItem[] }>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({});

  const refreshDetails = async (ticketId: number) => {
    const details = await getTicketDetails(ticketId);
    setTicketDetails((current) => ({
      ...current,
      [ticketId]: {
        comments: details.comments ?? [],
        histories: details.histories ?? [],
      },
    }));
  };

  const handleToggleDetails = async (ticketId: number) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null);
      return;
    }

    setExpandedTicketId(ticketId);
    if (ticketDetails[ticketId]) return;

    try {
      await refreshDetails(ticketId);
    } catch {
      addToast('Não foi possível carregar os detalhes do chamado.', 'error');
    }
  };

  const handleAddComment = async (ticketId: number) => {
    const text = commentDrafts[ticketId]?.trim();
    if (!text) {
      addToast('Escreva um comentário antes de salvar.', 'info');
      return;
    }

    setCommentLoading((current) => ({ ...current, [ticketId]: true }));
    try {
      await createComment(ticketId, { text });
      await refreshDetails(ticketId);
      setCommentDrafts((current) => ({ ...current, [ticketId]: '' }));
      addToast('Comentário adicionado com sucesso.');
    } catch (error: unknown) {
      addToast(
        error instanceof Error ? error.message : 'Falha ao adicionar o comentário.',
        'error',
      );
    } finally {
      setCommentLoading((current) => ({ ...current, [ticketId]: false }));
    }
  };

  return {
    expandedTicketId,
    ticketDetails,
    commentDrafts,
    setCommentDrafts,
    commentLoading,
    refreshDetails,
    handleToggleDetails,
    handleAddComment,
  };
}
