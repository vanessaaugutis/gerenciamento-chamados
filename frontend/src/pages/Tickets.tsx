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
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import FormField from '../components/FormField';
import Message from '../components/Message';
import PageCard from '../components/PageCard';
import ConfirmModal from '../components/ConfirmModal';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../hooks/useToast';

const priorities = ['Baixa', 'Média', 'Alta', 'Crítica'];
const statuses = ['Aberto', 'Em Atendimento', 'Aguardando Usuário', 'Finalizado'];
const sortOptions = [
  { value: 'createdAt', label: 'Data de criação' },
  { value: 'subject',   label: 'Assunto' },
  { value: 'requester', label: 'Solicitante' },
  { value: 'category',  label: 'Categoria' },
  { value: 'priority',  label: 'Prioridade' },
  { value: 'status',    label: 'Status' },
  { value: 'dueDate',   label: 'Prazo' },
];

function TicketsPage() {
  const { toasts, addToast, removeToast } = useToast();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('Média');
  const [status, setStatus] = useState('Aberto');
  const [responsibleId, setResponsibleId] = useState('');
  const [dueDate, setDueDate] = useState('');
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const [ticketDetails, setTicketDetails] = useState<Record<number, { comments: Comment[]; histories: HistoryItem[] }>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({});
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);

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
  }, []);

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setCategoryId('');
    setPriority('Média');
    setStatus('Aberto');
    setResponsibleId('');
    setDueDate('');
    setEditingId(null);
    setFormError('');
    setShowTicketModal(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setFormError('Informe assunto e descrição do chamado.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      const payload = {
        subject: subject.trim(),
        description: description.trim(),
        categoryId: categoryId ? Number(categoryId) : undefined,
        priority,
        status,
        responsibleId: responsibleId ? Number(responsibleId) : undefined,
        requesterId: getUserId() ?? undefined,
        dueDate: dueDate || undefined,
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
    } catch(error: any) {
      setFormError(error.message || 'Falha ao salvar o chamado.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingId(ticket.id);
    setSubject(ticket.subject);
    setDescription(ticket.description);
    setCategoryId(ticket.category?.id?.toString() ?? '');
    setPriority(ticket.priority);
    setStatus(ticket.status);
    setResponsibleId(ticket.responsible?.id?.toString() ?? '');
    setDueDate(ticket.dueDate ? ticket.dueDate.slice(0, 10) : '');
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
      await createComment(ticketId, { text, userId: 1 });
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

  return (
    <>
      <PageCard maxWidth={1100}>
        <div className="page-header">
          <h1>Chamados</h1>
          <Button variant="primary" onClick={() => setShowTicketModal(true)}>
            Novo chamado
          </Button>
        </div>

        <Modal
          visible={showTicketModal}
          title={editingId ? 'Editar chamado' : 'Novo chamado'}
          onClose={resetForm}
        >
          <form onSubmit={handleSubmit} className="auth-form">
            <FormField label="Assunto" required>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex.: Erro no login"
              />
            </FormField>

            <FormField label="Descrição" required>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o problema"
              />
            </FormField>

            <FormField label="Categoria">
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Prioridade">
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                {priorities.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {statuses.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Responsável">
              <Select value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)}>
                <option value="">Sem responsável</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Prazo de atendimento">
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </FormField>

            <Message text={formError} type="error" />

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Salvando...' : editingId ? 'Atualizar chamado' : 'Cadastrar chamado'}
              </Button>
              {editingId ? (
                <Button type="button" variant="cancel" onClick={resetForm}>
                  Cancelar edição
                </Button>
              ) : null}
            </div>
          </form>
        </Modal>

        {/* Filtros */}
        <div className={`filters-section${filtersOpen ? ' filters-section--open' : ''}`}>
          <button
            type="button"
            className="filters-toggle"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            <span>Filtros e ordenação</span>
            <svg
              className={`filters-toggle__icon${filtersOpen ? ' filters-toggle__icon--open' : ''}`}
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {filtersOpen && (
            <>
              <div className="filters-grid">
                <FormField label="Pesquisa por assunto">
                  <Input
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    placeholder="Digite o assunto"
                  />
                </FormField>

                <FormField label="Pesquisa por solicitante">
                  <Input
                    value={filterRequester}
                    onChange={(e) => setFilterRequester(e.target.value)}
                    placeholder="Nome ou e-mail"
                  />
                </FormField>

                <FormField label="Categoria">
                  <Select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)}>
                    <option value="">Todas</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Prioridade">
                  <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                    <option value="">Todas</option>
                    {priorities.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Status">
                  <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Todos</option>
                    {statuses.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Ordenar por">
                  <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Direção">
                  <Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')}
                  >
                    <option value="ASC">Crescente</option>
                    <option value="DESC">Decrescente</option>
                  </Select>
                </FormField>

                <FormField label="Itens por página">
                  <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </Select>
                </FormField>
              </div>

              <div className="filters-actions">
                <Button variant="primary" onClick={() => void loadData(1)} disabled={listLoading}>
                  {listLoading ? 'Carregando...' : 'Aplicar filtros'}
                </Button>
                <Button
                  variant="cancel"
                  onClick={() => {
                    setFilterSubject('');
                    setFilterRequester('');
                    setFilterCategoryId('');
                    setFilterPriority('');
                    setFilterStatus('');
                    setSortBy('createdAt');
                    setSortOrder('DESC');
                    setPageSize(5);
                    setTimeout(() => void loadData(1), 0);
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 12, color: '#475569', fontSize: '0.9rem' }}>
          Exibindo {tickets.length} de {totalItems} chamado(s) • Página {page} de {totalPages}
        </div>

        <ul className="list-card">
          {tickets.length === 0 ? (
            <li>Nenhum chamado corresponde aos filtros aplicados.</li>
          ) : (
            tickets.map((ticket) => (
              <li key={ticket.id} className="ticket-item">
                {/* Cabeçalho: info + botões */}
                <div className="ticket-item__header">
                  <div className="ticket-item__info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      {ticket.priority === 'Crítica' && (
                        <span className="ticket-critical-badge">⚠ CRÍTICO</span>
                      )}
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{ticket.subject}</strong>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 8 }}>{ticket.description}</div>
                    <div className="ticket-meta">
                      {ticket.category?.name && (
                        <span className="ticket-badge ticket-badge--category">
                          {ticket.category.name}
                        </span>
                      )}
                      <span className={`ticket-badge ticket-badge--priority ticket-badge--priority-${ticket.priority.toLowerCase().replace(' ', '-')}`}>
                        {ticket.priority}
                      </span>
                      <span className={`ticket-badge ticket-badge--status ticket-badge--status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {ticket.status}
                      </span>
                      {ticket.responsible?.name && (
                        <span className="ticket-badge ticket-badge--requester">
                          👤 {ticket.responsible.name}
                        </span>
                      )}
                      {ticket.dueDate && (
                        <span className="ticket-badge ticket-badge--due">
                          📅 {new Date(ticket.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ticket-item__actions">
                    <Button variant="warning" size="sm" onClick={() => handleEdit(ticket)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteRequest(ticket.id)}>
                      Excluir
                    </Button>
                  </div>
                </div>

                {/* Detalhes expansíveis */}
                <div className="ticket-item__details-row">
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => void handleToggleDetails(ticket.id)}
                  >
                    {expandedTicketId === ticket.id ? 'Ocultar detalhes' : 'Ver comentários e histórico'}
                  </Button>

                  {expandedTicketId === ticket.id ? (
                    <div className="ticket-item__expanded">
                      <div className="auth-form" style={{ gap: 8 }}>
                        <FormField label="Comentário">
                          <textarea
                            className="form-input"
                            value={commentDrafts[ticket.id] ?? ''}
                            onChange={(e) =>
                              setCommentDrafts((current) => ({ ...current, [ticket.id]: e.target.value }))
                            }
                            rows={3}
                            placeholder="Adicione um comentário"
                            style={{ resize: 'vertical', minHeight: 80 }}
                          />
                        </FormField>
                        <Button
                          variant="primary"
                          onClick={() => void handleAddComment(ticket.id)}
                          disabled={commentLoading[ticket.id]}
                          style={{ alignSelf: 'flex-start' }}
                        >
                          {commentLoading[ticket.id] ? 'Salvando...' : 'Salvar comentário'}
                        </Button>
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 8px' }}>Comentários</h4>
                        {(ticketDetails[ticket.id]?.comments ?? []).length === 0 ? (
                          <p style={{ color: '#64748b', margin: 0 }}>Nenhum comentário ainda.</p>
                        ) : (
                          <ul className="detail-list">
                            {(ticketDetails[ticket.id]?.comments ?? []).map((comment) => (
                              <li key={comment.id}>
                                <strong>{comment.user?.name ?? 'Usuário'}</strong> •{' '}
                                {comment.createdAt ? new Date(comment.createdAt).toLocaleString('pt-BR') : '-'}
                                <div style={{ color: '#334155', wordBreak: 'break-word' }}>{comment.text}</div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 8px' }}>Histórico</h4>
                        {(ticketDetails[ticket.id]?.histories ?? []).length === 0 ? (
                          <p style={{ color: '#64748b', margin: 0 }}>Nenhuma alteração registrada.</p>
                        ) : (
                          <ul className="detail-list">
                            {(ticketDetails[ticket.id]?.histories ?? []).map((history) => (
                              <li key={history.id}>
                                <strong>{history.user?.name ?? 'Usuário'}</strong> •{' '}
                                {history.createdAt ? new Date(history.createdAt).toLocaleDateString('pt-BR') : '-'}
                                <div style={{ color: '#334155', wordBreak: 'break-word' }}>{history.change}</div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="pagination-bar">
          <Button
            variant="secondary"
            onClick={() => void loadData(page - 1)}
            disabled={page <= 1 || listLoading}
          >
            Anterior
          </Button>
          <span className="pagination-info">Página {page} de {totalPages}</span>
          <Button
            variant="primary"
            onClick={() => void loadData(page + 1)}
            disabled={page >= totalPages || listLoading}
          >
            Próxima
          </Button>
        </div>
      </PageCard>

      <ConfirmModal
        visible={confirmVisible}
        message="Deseja excluir este chamado? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={handleDeleteCancel}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default TicketsPage;
