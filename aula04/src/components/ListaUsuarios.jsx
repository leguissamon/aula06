import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, mensagemDeErro } from '../api'

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [editando, setEditando] = useState(null) // usuário sendo editado
  const [novoUsuario, setNovoUsuario] = useState(null) // null = form fechado

  useEffect(() => {
    const controle = new AbortController()
    const signal = controle.signal

    async function buscar() {
      try {
        setCarregando(true)
        setErro(null)
        // para testar o 404: troque '/users' por '/testehttp'
        const data = await apiGet('/users', { signal })
        // const data = [] // descomente para testar o estado vazio
        setUsuarios(data)
      } catch (e) {
        if (e.name !== 'AbortError') {
          setErro(mensagemDeErro(e))
        }
      } finally {
        if (!signal.aborted) setCarregando(false)
      }
    }

    buscar()
    return () => controle.abort()
  }, [])

  ///// excluir usuario /////
  async function excluirUsuario(id) {
    const backup = usuarios
    setUsuarios(prev => prev.filter(u => u.id !== id)) // remove otimista
    setErro(null)

    try {
      await apiDelete(`/users/${id}`) // para testar, troque /users por /teste
      console.log(`Usuário ${id} excluído`)
    } catch (e) {
      setUsuarios(backup) // rollback
      setErro(mensagemDeErro(e))
    }
  }

  ///// editar usuario /////
  async function salvarEdicao(e) {
    e.preventDefault()
    const backup = usuarios
    setErro(null)

    try {
      const usuarioAtualizado = await apiPut(`/users/${editando.id}`, editando)
      setUsuarios(prev =>
        prev.map(u => (u.id === editando.id ? usuarioAtualizado : u))
      )
      setEditando(null)
    } catch (e) {
      setUsuarios(backup) // rollback
      setErro(mensagemDeErro(e))
    }
  }

  ///// criar usuario /////
  async function criarUsuario(e) {
    e.preventDefault()
    const backup = usuarios
    setErro(null)

    try {
      // Exercício 5: header extra, combinado com o Content-Type padrão
      const criado = await apiPost('/users', novoUsuario, {
        headers: { 'X-Custom': 'aula07' },
      })
      setUsuarios(prev => [...prev, criado])
      setNovoUsuario(null)
    } catch (e) {
      setUsuarios(backup)
      setErro(mensagemDeErro(e))
    }
  }

  if (carregando) return <p>Carregando...</p>
  if (erro && usuarios.length === 0) return <p>Erro: {erro}</p>
  if (usuarios.length === 0) return <p>Nenhum usuário encontrado.</p>

  return (
    <>
      {erro && <p>Erro: {erro}</p>}

      {novoUsuario ? (
        <form onSubmit={criarUsuario}>
          <input
            placeholder="Nome"
            value={novoUsuario.name}
            onChange={e => setNovoUsuario({ ...novoUsuario, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={novoUsuario.email}
            onChange={e => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
          />
          <button type="submit">Salvar</button>
          <button type="button" onClick={() => setNovoUsuario(null)}>Cancelar</button>
        </form>
      ) : (
        <button onClick={() => setNovoUsuario({ name: '', email: '' })}>Novo</button>
      )}

      <ul>
        {usuarios.map(u => (
          <li key={u.id}>
            {editando?.id === u.id ? (
              <form onSubmit={salvarEdicao}>
                <input
                  value={editando.name}
                  onChange={e => setEditando({ ...editando, name: e.target.value })}
                />
                <input
                  value={editando.email}
                  onChange={e => setEditando({ ...editando, email: e.target.value })}
                />
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => setEditando(null)}>Cancelar</button>
              </form>
            ) : (
              <>
                {u.name}
                <button onClick={() => setEditando(u)}>Editar</button>
                <button onClick={() => excluirUsuario(u.id)}>Excluir</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}