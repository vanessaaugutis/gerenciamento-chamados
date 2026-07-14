import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import FormField from '../components/FormField';
import Message from '../components/Message';
import PageCard from '../components/PageCard';
import ConfirmModal from '../components/ConfirmModal';
import ToastContainer from '../components/ToastContainer';
import { useTickets } from '../hooks/useTickets';

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
  const {
    toasts, removeToast,
    form, setFormField,
    editingId, formError, loading,
    showTicketModal, setShowTicketModal,
    resetForm, handleSubmit, handleEdit,
    tickets, categories, users, listLoading, loadData,
    filterSubject,    setFilterSubject,
    filterRequester,  setFilterRequester,
    filterCategoryId, setFilterCategoryId,
    filterPriority,   setFilterPriority,
    filterStatus,     setFilterStatus,
    sortBy,           setSortBy,
    sortOrder,        setSortOrder,
    filtersOpen,      setFiltersOpen,
    clearFilters,
    page, pageSize, setPageSize, totalPages, totalItems,
    expandedTicketId, ticketDetails,
    commentDrafts, setCommentDrafts,
    commentLoading,
    handleToggleDetails, handleAddComment,
    confirmVisible,
    handleDeleteRequest, handleDeleteConfirm, handleDeleteCancel,
    formatDate,
  } = useTickets();

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
                value={form.subject}
                onChange={(e) => setFormField('subject', e.target.value)}
                placeholder="Ex.: Erro no login"
              />
            </FormField>

            <FormField label="Descrição" required>
              <Input
                value={form.description}
                onChange={(e) => setFormField('description', e.target.value)}
                placeholder="Descreva o problema"
              />
            </FormField>

            <FormField label="Categoria">
              <Select value={form.categoryId} onChange={(e) => setFormField('categoryId', e.target.value)}>
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Prioridade">
              <Select value={form.priority} onChange={(e) => setFormField('priority', e.target.value)}>
                {priorities.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setFormField('status', e.target.value)}>
                {statuses.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Responsável">
              <Select value={form.responsibleId} onChange={(e) => setFormField('responsibleId', e.target.value)}>
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
                value={form.dueDate}
                onChange={(e) => setFormField('dueDate', e.target.value)}
              />
            </FormField>

            <Message text={formError} type="error" />

            <div className="form-actions">
              {editingId ? (
                <Button type="button" variant="cancel" onClick={resetForm}>
                  Cancelar edição
                </Button>
              ) : null}
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Salvando...' : editingId ? 'Atualizar chamado' : 'Cadastrar chamado'}
              </Button>
            </div>
          </form>
        </Modal>

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
                <Button variant="cancel" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="results-count">
          Exibindo {tickets.length} de {totalItems} chamado(s) • Página {page} de {totalPages}
        </p>

        <ul className="list-card">
          {tickets.length === 0 ? (
            <li>Nenhum chamado corresponde aos filtros aplicados.</li>
          ) : (
            tickets.map((ticket) => (
              <li key={ticket.id} className="ticket-item">
                <div className="ticket-item__header">
                  <div className="ticket-item__info">
                    <div className="ticket-subject-row">
                      {ticket.priority === 'Crítica' && (
                        <span className="ticket-critical-badge">⚠ CRÍTICO</span>
                      )}
                      <strong className="ticket-subject">{ticket.subject}</strong>
                    </div>
                    <p className="ticket-description">{ticket.description}</p>
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
                          📅 {formatDate(ticket.dueDate)}
                        </span>
                      )}
                       {ticket.requester && (
                        <span className="ticket-badge ticket-badge--category">
                          Aberto por {ticket.requester.name} em {formatDate(ticket.dueDate)}
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

                <div className="ticket-item__details-row">
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => void handleToggleDetails(ticket.id)}
                  >
                    {expandedTicketId === ticket.id ? 'Ocultar detalhes' : 'Ver comentários e histórico'}
                  </Button>

                  {expandedTicketId === ticket.id && (
                    <div className="ticket-item__expanded">
                      <div className="comment-form">
                        <FormField label="Comentário">
                          <textarea
                            className="form-input comment-textarea"
                            value={commentDrafts[ticket.id] ?? ''}
                            onChange={(e) =>
                              setCommentDrafts((current) => ({ ...current, [ticket.id]: e.target.value }))
                            }
                            rows={3}
                            placeholder="Adicione um comentário"
                          />
                        </FormField>
                        <Button
                          variant="primary"
                          className="comment-submit"
                          onClick={() => void handleAddComment(ticket.id)}
                          disabled={commentLoading[ticket.id]}
                        >
                          {commentLoading[ticket.id] ? 'Salvando...' : 'Salvar comentário'}
                        </Button>
                      </div>

                      <div>
                        <h4 className="detail-heading">Comentários</h4>
                        {(ticketDetails[ticket.id]?.comments ?? []).length === 0 ? (
                          <p className="detail-empty">Nenhum comentário ainda.</p>
                        ) : (
                          <ul className="detail-list">
                            {(ticketDetails[ticket.id]?.comments ?? []).map((comment) => (
                              <li key={comment.id}>
                                <strong>{comment.user?.name ?? 'Usuário'}</strong> •{' '}
                                {comment.createdAt
                                  ? new Date(comment.createdAt).toLocaleString('pt-BR')
                                  : '-'}
                                <div className="detail-text">{comment.text}</div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div>
                        <h4 className="detail-heading">Histórico</h4>
                        {(ticketDetails[ticket.id]?.histories ?? []).length === 0 ? (
                          <p className="detail-empty">Nenhuma alteração registrada.</p>
                        ) : (
                          <ul className="detail-list">
                            {(ticketDetails[ticket.id]?.histories ?? []).map((history) => (
                              <li key={history.id}>
                                <strong>{history.user?.name ?? 'Usuário'}</strong> •{' '}
                                {history.createdAt
                                  ? new Date(history.createdAt).toLocaleString('pt-BR')
                                  : '-'}
                                <div className="detail-text">{history.change}</div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
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
