import { useEffect, useState } from 'react';
import {
  createTicket,
  deleteTicket,
  listTickets,
  updateTicket,
  type Ticket,
  type TicketListParams,
} from '../services/tickets';
import { listCategories, type Category } from '../services/categories';
import { listUsers, type UserSummary } from '../services/users';
import { getUserId } from '../services/auth';
import { useToast } from './useToast';
import { useTicketDetails } from './useTicketDetails';
import { useTicketFilters } from './useTicketFilters';

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

  const {
    filterSubject,
    setFilterSubject,
    filterRequester,
    setFilterRequester,
    filterCategoryId,
    setFilterCategoryId,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filtersOpen,
    setFiltersOpen,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
  } = useTicketFilters();

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const {
    expandedTicketId,
    ticketDetails,
    commentDrafts,
    setCommentDrafts,
    commentLoading,
    refreshDetails,
    handleToggleDetails,
    handleAddComment,
  } = useTicketDetails(addToast);

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

  const loadData = async (
    nextPage = 1,
    overrides: Partial<TicketListParams> = {},
  ) => {
    setListLoading(true);
    try {
      const [ticketsResponse, categoriesResponse, usersResponse] = await Promise.all([
        listTickets({
          subject: overrides.subject ?? filterSubject,
          requester: overrides.requester ?? filterRequester,
          categoryId: overrides.categoryId ?? filterCategoryId,
          priority: overrides.priority ?? filterPriority,
          status: overrides.status ?? filterStatus,
          sortBy: overrides.sortBy ?? sortBy,
          order: overrides.order ?? sortOrder,
          page: nextPage,
          limit: overrides.limit ?? pageSize,
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
        await refreshDetails(editedTicketId);
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

  const clearFilters = () => {
    resetFilters();
    void loadData(1, {
      subject: '',
      requester: '',
      categoryId: '',
      priority: '',
      status: '',
      sortBy: 'createdAt',
      order: 'DESC',
      limit: 5,
    });
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
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
