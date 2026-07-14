import { useEffect, useState } from 'react';
import {
  createComment,
  createTicket,
  deleteTicket,
  getTicketDetails,
  listTickets,
  updateTicket,
  type Comment,
  type HistoryItem,
  type Ticket,
} from '../services/tickets';
import { listCategories, type Category } from '../services/categories';
import { listUsers, type UserSummary } from '../services/users';
import { getUserId } from '../services/auth';
import { useToast } from './useToast';

export interface TicketFormState {
  subject: string;
  description: string;
  categoryId: string;
  priority: string;
  status: string;
  responsibleId: string;
  dueDate: string;
}

const defaultForm: TicketFormState = {
  subject: '',
  description: '',
  categoryId: '',
  priority: 'Média',
  status: 'Aberto',
  responsibleId: '',
  dueDate: '',
};

export function useTickets() {
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState<TicketFormState>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [filterSubject, setFilterSubject] = useState('');
  const [filterRequester, setFilterRequester] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const [ticketDetails, setTicketDetails] = useState<
    Record<number, { comments: Comment[]; histories: HistoryItem[] }>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({});

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const setFormField = <K extends keyof TicketFormState>(
    field: K,
    value: TicketFormState[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setFormError('');
    setShowTicketModal(false);
  };

  const loadData = async (nextPage = 1) => {
    setListLoading(true);
    try {
      const [ticketsResponse, categoriesResponse, usersResponse] = await Promise.all([
        listTickets({
          subject: filterSubject,
          requester: filterRequester,
          categoryId: filterCategoryId,
          priority: filterPriority,
          status: filterStatus,
          sortBy,
          order: sortOrder,
          page: nextPage,
          limit: pageSize,
        }),
        listCategories(),
        listUsers(),
      ]);
      setTickets(ticketsResponse.items);
      setCategories(categoriesResponse);
      setUsers(usersResponse);
      setPage(ticketsResponse.page);
      setTotalPages(ticketsResponse.totalPages);
      setTotalItems(ticketsResponse.total);
    } catch {
      addToast('Não foi possível carregar os dados.', 'error');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    void loadData(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setFormError('Informe assunto e descrição do chamado.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      const payload = {
        subject: form.subject.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        priority: form.priority,
        status: form.status,
        responsibleId: form.responsibleId ? Number(form.responsibleId) : undefined,
        requesterId: getUserId() ?? undefined,
        dueDate: form.dueDate || undefined,
      };

      const editedTicketId = editingId;
      if (editedTicketId) {
        await updateTicket(editedTicketId, payload);
        addToast('Chamado atualizado com sucesso.');
      } else {
        await createTicket(payload);
        addToast('Chamado criado com sucesso.');
      }

      await loadData(page);

      if (editedTicketId && expandedTicketId === editedTicketId) {
        const details = await getTicketDetails(editedTicketId);
        setTicketDetails((current) => ({
          ...current,
          [editedTicketId]: {
            comments: details.comments ?? [],
            histories: details.histories ?? [],
          },
        }));
      }

      resetForm();
    } catch (error: any) {
      setFormError(error.message || 'Falha ao salvar o chamado.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingId(ticket.id);
    setForm({
      subject: ticket.subject,
      description: ticket.description,
      categoryId: ticket.category?.id?.toString() ?? '',
      priority: ticket.priority,
      status: ticket.status,
      responsibleId: ticket.responsible?.id?.toString() ?? '',
      dueDate: ticket.dueDate ? ticket.dueDate.slice(0, 10) : '',
    });
    setShowTicketModal(true);
  };

  const handleDeleteRequest = (id: number) => {
    setPendingDeleteId(id);
    setConfirmVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (pendingDeleteId === null) return;
    setConfirmVisible(false);
    try {
      await deleteTicket(pendingDeleteId);
      await loadData(page);
      if (editingId === pendingDeleteId) resetForm();
      addToast('Chamado excluído com sucesso.');
    } catch (error: any) {
      addToast(error?.message || 'Falha ao excluir o chamado.', 'error');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmVisible(false);
    setPendingDeleteId(null);
  };

  const handleToggleDetails = async (ticketId: number) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null);
      return;
    }
    setExpandedTicketId(ticketId);
    if (ticketDetails[ticketId]) return;
    try {
      const details = await getTicketDetails(ticketId);
      setTicketDetails((current) => ({
        ...current,
        [ticketId]: {
          comments: details.comments ?? [],
          histories: details.histories ?? [],
        },
      }));
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
      const details = await getTicketDetails(ticketId);
      setTicketDetails((current) => ({
        ...current,
        [ticketId]: {
          comments: details.comments ?? [],
          histories: details.histories ?? [],
        },
      }));
      setCommentDrafts((current) => ({ ...current, [ticketId]: '' }));
      addToast('Comentário adicionado com sucesso.');
    } catch (error: any) {
      addToast(error?.message || 'Falha ao adicionar o comentário.', 'error');
    } finally {
      setCommentLoading((current) => ({ ...current, [ticketId]: false }));
    }
  };

  const clearFilters = () => {
    setFilterSubject('');
    setFilterRequester('');
    setFilterCategoryId('');
    setFilterPriority('');
    setFilterStatus('');
    setSortBy('createdAt');
    setSortOrder('DESC');
    setPageSize(5);
    setTimeout(() => void loadData(1), 0);
  };

  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  };

  return {
    toasts,
    removeToast,
    form,
    setFormField,
    editingId,
    formError,
    loading,
    showTicketModal,
    setShowTicketModal,
    resetForm,
    handleSubmit,
    handleEdit,
    tickets,
    categories,
    users,
    listLoading,
    loadData,
    filterSubject,   setFilterSubject,
    filterRequester, setFilterRequester,
    filterCategoryId, setFilterCategoryId,
    filterPriority,  setFilterPriority,
    filterStatus,    setFilterStatus,
    sortBy,          setSortBy,
    sortOrder,       setSortOrder,
    filtersOpen,     setFiltersOpen,
    clearFilters,
    page,
    pageSize,        setPageSize,
    totalPages,
    totalItems,
    expandedTicketId,
    ticketDetails,
    commentDrafts,   setCommentDrafts,
    commentLoading,
    handleToggleDetails,
    handleAddComment,
    confirmVisible,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
    formatDate,
  };
}
