import { useEffect, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type Category,
} from '../services/categories'
import Modal from '../components/Modal'
import Button from '../components/Button'
import Input from '../components/Input'
import FormField from '../components/FormField'
import Message from '../components/Message'
import PageCard from '../components/PageCard'
import ConfirmModal from '../components/ConfirmModal'
import ToastContainer from '../components/ToastContainer'
import { useToast } from '../hooks/useToast'

function CategoriesPage() {
  const { toasts, addToast, removeToast } = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const [confirmVisible, setConfirmVisible] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const loadCategories = async () => {
    try {
      const data = await listCategories()
      setCategories(data)
    } catch {
      addToast('Não foi possível carregar as categorias.', 'error')
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  const resetForm = () => {
    setName('')
    setDescription('')
    setEditingId(null)
    setFormError('')
    setShowModal(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setFormError('Informe o nome da categoria.')
      return
    }

    setLoading(true)
    setFormError('')

    try {
      if (editingId) {
        await updateCategory(editingId, { name: name.trim(), description: description.trim() || undefined })
        addToast('Categoria atualizada com sucesso.')
      } else {
        await createCategory({ name: name.trim(), description: description.trim() || undefined })
        addToast('Categoria cadastrada com sucesso.')
      }

      await loadCategories()
      resetForm()
    } catch {
      setFormError('Falha ao salvar a categoria.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setName(category.name)
    setDescription(category.description ?? '')
    setShowModal(true)
  }

  const handleDeleteRequest = (id: number) => {
    setPendingDeleteId(id)
    setConfirmVisible(true)
  }

  const handleDeleteConfirm = async () => {
    if (pendingDeleteId === null) return
    setConfirmVisible(false)

    try {
      await deleteCategory(pendingDeleteId)
      await loadCategories()
      if (editingId === pendingDeleteId) resetForm()
      addToast('Categoria excluída com sucesso.')
    } catch {
      addToast('Falha ao excluir a categoria.', 'error')
    } finally {
      setPendingDeleteId(null)
    }
  }

  const handleDeleteCancel = () => {
    setConfirmVisible(false)
    setPendingDeleteId(null)
  }

  return (
    <>
      <PageCard maxWidth={1100}>
        <div className="page-header">
          <h1>Categorias</h1>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Nova categoria
          </Button>
        </div>

        <Modal
          visible={showModal}
          title={editingId ? 'Editar categoria' : 'Nova categoria'}
          onClose={resetForm}
        >
          <form onSubmit={handleSubmit} className="auth-form">
            <FormField label="Nome" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Suporte"
              />
            </FormField>

            <FormField label="Descrição">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a categoria"
              />
            </FormField>

            <Message text={formError} type="error" />

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Salvando...' : editingId ? 'Atualizar categoria' : 'Cadastrar categoria'}
              </Button>
              {editingId ? (
                <Button type="button" variant="cancel" onClick={resetForm}>
                  Cancelar edição
                </Button>
              ) : null}
            </div>
          </form>
        </Modal>

        <ul className="list-card">
          {categories.length === 0 ? (
            <li>Nenhuma categoria cadastrada ainda.</li>
          ) : (
            categories.map((category) => (
              <li
                key={category.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
              >
                <div>
                  <strong>{category.name}</strong>
                  {category.description ? (
                    <div style={{ color: '#64748b' }}>{category.description}</div>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="warning" size="sm" onClick={() => handleEdit(category)}>
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteRequest(category.id)}>
                    Excluir
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </PageCard>

      <ConfirmModal
        visible={confirmVisible}
        message="Deseja excluir esta categoria? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={handleDeleteCancel}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

export default CategoriesPage
