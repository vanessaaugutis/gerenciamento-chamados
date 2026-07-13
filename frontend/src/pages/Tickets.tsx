import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createComment, createTicket, deleteTicket, getTicketDetails, listTickets, updateTicket, type Comment, type HistoryItem, type Ticket } from '../services/tickets';
import { listCategories, type Category } from '../services/categories';
import Modal from '../components/Modal';

const priorities = ['Baixa', 'Média', 'Alta', 'Crítica'];
const statuses = ['Aberto', 'Em Atendimento', 'Aguardando Usuário', 'Finalizado'];
const sortOptions = [
  { value: 'createdAt', label: 'Data de criação' },
  { value: 'subject', label: 'Assunto' },
  { value: 'requester', label: 'Solicitante' },
  { value: 'category', label: 'Categoria' },
  { value: 'priority', label: 'Prioridade' },
  { value: 'status', label: 'Status' },
  { value: 'dueDate', label: 'Prazo' },
];

function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('Média');
  const [status, setStatus] = useState('Aberto');
  const [responsibleId, setResponsibleId] = useState('');
  const [requesterId, setRequesterId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
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
  const [commentUserIds, setCommentUserIds] = useState<Record<number, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({});

  const loadData = async (nextPage = 1) => {
    setListLoading(true);
    try {
      const [ticketsResponse, categoriesResponse] = await Promise.all([
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
      ]);
      setTickets(ticketsResponse.items);
      setCategories(categoriesResponse);
      setPage(ticketsResponse.page);
      setTotalPages(ticketsResponse.totalPages);
      setTotalItems(ticketsResponse.total);
    } catch {
      setMessage('Não foi possível carregar os dados.');
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
    setRequesterId('');
    setDueDate('');
    setEditingId(null);
    setShowTicketModal(false);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setMessage('Informe assunto e descrição do chamado.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        subject: subject.trim(),
        description: description.trim(),
        categoryId: categoryId ? Number(categoryId) : undefined,
        priority,
        status,
        responsibleId: responsibleId ? Number(responsibleId) : undefined,
        requesterId: requesterId ? Number(requesterId) : undefined,
        dueDate: dueDate || undefined,
      };

      if (editingId) {
        await updateTicket(editingId, payload);
        setMessage('Chamado atualizado com sucesso.');
      } else {
        await createTicket(payload);
        setMessage('Chamado criado com sucesso.');
      }

      await loadData(page);
      resetForm();
    } catch {
      setMessage('Falha ao salvar o chamado.');
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
    setRequesterId(ticket.requester?.id?.toString() ?? '');
    setDueDate(ticket.dueDate ? ticket.dueDate.slice(0, 10) : '');
    setShowTicketModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja excluir este chamado?')) {
      return;
    }

    try {
      await deleteTicket(id);
      await loadData(page);
      if (editingId === id) {
        resetForm();
      }
      setMessage('Chamado excluído com sucesso.');
    } catch {
      setMessage('Falha ao excluir o chamado.');
    }
  };

  const handleApplyFilters = () => {
    void loadData(1);
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
    setTimeout(() => {
      void loadData(1);
    }, 0);
  };

  const handleToggleDetails = async (ticketId: number) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null);
      return;
    }

    setExpandedTicketId(ticketId);
    if (ticketDetails[ticketId]) {
      return;
    }

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
      setMessage('Não foi possível carregar os detalhes do chamado.');
    }
  };

  const handleAddComment = async (ticketId: number) => {
    const text = commentDrafts[ticketId]?.trim();

    if (!text) {
      setMessage('Escreva um comentário antes de salvar.');
      return;
    }

    setCommentLoading((current) => ({ ...current, [ticketId]: true }));

    try {
      await createComment(ticketId, {
        text,
        userId: commentUserIds[ticketId] ? Number(commentUserIds[ticketId]) : 1,
      });

      const details = await getTicketDetails(ticketId);
      setTicketDetails((current) => ({
        ...current,
        [ticketId]: {
          comments: details.comments ?? [],
          histories: details.histories ?? [],
        },
      }));
      setCommentDrafts((current) => ({ ...current, [ticketId]: '' }));
      setMessage('Comentário adicionado com sucesso.');
    } catch {
      setMessage('Falha ao adicionar o comentário.');
    } finally {
      setCommentLoading((current) => ({ ...current, [ticketId]: false }));
    }
  };

  return (
    <div className="page-card" style={{ width: 'min(100%, 1100px)' }}>
      <h1>Chamados</h1>
      <p>Gerencie os chamados com assunto, categoria, prioridade, status e prazo.</p>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button type="button" onClick={() => setShowTicketModal(true)}>
          Novo chamado
        </button>
      </div>

      <Modal visible={showTicketModal} title={editingId ? 'Editar chamado' : 'Novo chamado'} onClose={() => setShowTicketModal(false)}>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Assunto
            <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Ex.: Erro no login" />
          </label>

          <label>
            Descrição
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descreva o problema" />
          </label>

          <label>
            Categoria
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Prioridade
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Responsável (ID)
            <input value={responsibleId} onChange={(event) => setResponsibleId(event.target.value)} placeholder="ID do usuário responsável" />
          </label>

          <label>
            Solicitante (ID)
            <input value={requesterId} onChange={(event) => setRequesterId(event.target.value)} placeholder="ID do usuário solicitante" />
          </label>

          <label>
            Prazo de atendimento
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : editingId ? 'Atualizar chamado' : 'Cadastrar chamado'}
            </button>
            {editingId ? (
              <button type="button" onClick={resetForm} style={{ background: '#64748b', marginTop: 0 }}>
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>
      </Modal>

      {message ? <p style={{ color: '#2563eb', marginTop: 12 }}>{message}</p> : null}

      <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Listagem</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <label>
            Pesquisa por assunto
            <input value={filterSubject} onChange={(event) => setFilterSubject(event.target.value)} placeholder="Digite o assunto" />
          </label>
          <label>
            Pesquisa por solicitante
            <input value={filterRequester} onChange={(event) => setFilterRequester(event.target.value)} placeholder="Nome ou e-mail" />
          </label>
          <label>
            Categoria
            <select value={filterCategoryId} onChange={(event) => setFilterCategoryId(event.target.value)}>
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Prioridade
            <select value={filterPriority} onChange={(event) => setFilterPriority(event.target.value)}>
              <option value="">Todas</option>
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="">Todos</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ordenar por
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Direção
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'ASC' | 'DESC')}>
              <option value="ASC">Crescente</option>
              <option value="DESC">Decrescente</option>
            </select>
          </label>
          <label>
            Itens por página
            <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={handleApplyFilters} disabled={listLoading}>
            {listLoading ? 'Carregando...' : 'Aplicar filtros'}
          </button>
          <button type="button" onClick={clearFilters} style={{ background: '#64748b' }}>
            Limpar filtros
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12, color: '#475569' }}>
        Exibindo {tickets.length} de {totalItems} chamado(s) • Página {page} de {totalPages}
      </div>

      <ul className="list-card">
        {tickets.length === 0 ? (
          <li>Nenhum chamado corresponde aos filtros aplicados.</li>
        ) : (
          tickets.map((ticket) => (
            <li key={ticket.id} style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <strong>{ticket.subject}</strong>
                  <div style={{ color: '#64748b' }}>{ticket.description}</div>
                  <div style={{ fontSize: '0.9rem' }}>
                    Categoria: {ticket.category?.name ?? '-'} | Prioridade: {ticket.priority} | Status: {ticket.status} | Solicitante: {ticket.requester?.name ?? '-'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => handleEdit(ticket)} style={{ background: '#f59e0b', padding: '8px 10px' }}>
                    Editar
                  </button>
                  <button type="button" onClick={() => handleDelete(ticket.id)} style={{ background: '#ef4444', padding: '8px 10px' }}>
                    Excluir
                  </button>
                </div>
              </div>

              <div style={{ paddingTop: 0 }}>
                <div style={{ marginTop: 8, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                  <button type="button" onClick={() => void handleToggleDetails(ticket.id)} style={{ background: '#0f766e', padding: '8px 10px' }}>
                    {expandedTicketId === ticket.id ? 'Ocultar detalhes' : 'Ver comentários e histórico'}
                  </button>

                  {expandedTicketId === ticket.id ? (
                    <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <label>
                          Comentário
                          <textarea
                            value={commentDrafts[ticket.id] ?? ''}
                            onChange={(event) => setCommentDrafts((current) => ({ ...current, [ticket.id]: event.target.value }))}
                            rows={3}
                            placeholder="Adicione um comentário"
                          />
                        </label>
                        <label>
                          Usuário (ID)
                          <input
                            value={commentUserIds[ticket.id] ?? '1'}
                            onChange={(event) => setCommentUserIds((current) => ({ ...current, [ticket.id]: event.target.value }))}
                            placeholder="ID do usuário"
                          />
                        </label>
                        <button type="button" onClick={() => void handleAddComment(ticket.id)} disabled={commentLoading[ticket.id]} style={{ width: 'fit-content' }}>
                          {commentLoading[ticket.id] ? 'Salvando...' : 'Adicionar comentário'}
                        </button>
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 8px' }}>Comentários</h4>
                        {(ticketDetails[ticket.id]?.comments ?? []).length === 0 ? (
                          <p style={{ color: '#64748b', margin: 0 }}>Nenhum comentário ainda.</p>
                        ) : (
                          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
                            {(ticketDetails[ticket.id]?.comments ?? []).map((comment) => (
                              <li key={comment.id}>
                                <strong>{comment.user?.name ?? 'Usuário'}</strong> • {comment.createdAt ? new Date(comment.createdAt).toLocaleString('pt-BR') : '-'}
                                <div style={{ color: '#334155' }}>{comment.text}</div>
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
                          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
                            {(ticketDetails[ticket.id]?.histories ?? []).map((history) => (
                              <li key={history.id}>
                                <strong>{history.user?.name ?? 'Usuário'}</strong> • {history.createdAt ? new Date(history.createdAt).toLocaleDateString('pt-BR') : '-'}
                                <div style={{ color: '#334155' }}>{history.change}</div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <button type="button" onClick={() => void loadData(page - 1)} disabled={page <= 1 || listLoading} style={{ background: '#64748b' }}>
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button type="button" onClick={() => void loadData(page + 1)} disabled={page >= totalPages || listLoading}>
          Próxima
        </button>
      </div>

      <p className="page-link">
        <Link to="/dashboard">Voltar ao dashboard</Link>
      </p>
    </div>
  );
}

export default TicketsPage;
