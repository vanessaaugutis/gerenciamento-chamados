import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createCategory, deleteCategory, listCategories, updateCategory, type Category } from '../services/categories'
import Modal from '../components/Modal'

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showModal, setShowModal] = useState(false)

  const loadCategories = async () => {
    try {
      const data = await listCategories()
      setCategories(data)
    } catch {
      setMessage('Não foi possível carregar as categorias.')
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  const resetForm = () => {
    setName('')
    setDescription('')
    setEditingId(null)
    setShowModal(false)
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    if (!name.trim()) {
      setMessage('Informe o nome da categoria.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      if (editingId) {
        await updateCategory(editingId, { name: name.trim(), description: description.trim() || undefined })
        setMessage('Categoria atualizada com sucesso.')
      } else {
        await createCategory({ name: name.trim(), description: description.trim() || undefined })
        setMessage('Categoria cadastrada com sucesso.')
      }

      await loadCategories()
      resetForm()
    } catch {
      setMessage('Falha ao salvar a categoria.')
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja excluir esta categoria?')) {
      return
    }

    try {
      await deleteCategory(id)
      await loadCategories()
      if (editingId === id) {
        resetForm()
      }
      setMessage('Categoria excluída com sucesso.')
    } catch {
      setMessage('Falha ao excluir a categoria.')
    }
  }

  return (
    <div className="page-card" style={{ width: 'min(100%, 720px)' }}>
      <h1>Categorias</h1>
      <p>Cadastre, edite ou remova categorias para os chamados.</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button type="button" onClick={() => setShowModal(true)}>
          Nova categoria
        </button>
      </div>

      <Modal visible={showModal} title={editingId ? 'Editar categoria' : 'Nova categoria'} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Nome
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Suporte" />
          </label>

          <label>
            Descrição
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descreva a categoria" />
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : editingId ? 'Atualizar categoria' : 'Cadastrar categoria'}
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

      <ul className="list-card">
        {categories.length === 0 ? (
          <li>Nenhuma categoria cadastrada ainda.</li>
        ) : (
          categories.map((category) => (
            <li key={category.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <strong>{category.name}</strong>
                {category.description ? <div style={{ color: '#64748b' }}>{category.description}</div> : null}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => handleEdit(category)} style={{ background: '#f59e0b', padding: '8px 10px' }}>
                  Editar
                </button>
                <button type="button" onClick={() => handleDelete(category.id)} style={{ background: '#ef4444', padding: '8px 10px' }}>
                  Excluir
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      <p className="page-link">
        <Link to="/dashboard">Voltar ao dashboard</Link>
      </p>
    </div>
  )
}

export default CategoriesPage
