import { useEffect, useState } from 'react'

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [editando, setEditando] = useState(null) // vai guardar o usuário sendo editado
  const [novoUsuario, setNovoUsuario] = useState(null) // null = form fechado

  useEffect(() => {
    const controle = new AbortController() 
    const signal = controle.signal          

    async function buscar() {
      try {
        setCarregando(true)
        setErro(null)
        const resp = await fetch('https://jsonplaceholder.typicode.com/users', { signal })
        // const resp = await fetch('https://jsonplaceholder.typicode.com/testehttp', { signal }) // descomente para testar o erro
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const data = await resp.json()
      // const data = [] // descomente para testar o estado vazio
        setUsuarios(data)
      } catch (e) {
        if (e.name !== 'AbortError') {
          
          setErro(e.message)
        }
      } finally {
        setCarregando(false)
      }
    }

    buscar()

    
    return () => controle.abort()
  }, [])


  /////excluir usuario////

  async function excluirUsuario(id) {
  const backup = usuarios
  setUsuarios(prev => prev.filter(u => u.id !== id)) // remove otimista
  setErro(null)

  try {
    const resp = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, { //para testar, só mudar o /users para /teste ou outro rota 
      method: 'DELETE'
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    console.log(`Usuário ${id} excluído`)
  } catch (e) {
    setUsuarios(backup) // rollback
    setErro(e.message)
  }
}

///editar usuario///
async function salvarEdicao(e) {
  e.preventDefault()
  const backup = usuarios
  setErro(null)

  try {
    const resp = await fetch(`https://jsonplaceholder.typicode.com/users/${editando.id}`, {//para testar, só mudar o /users para /teste ou outro rota 
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editando)
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

    const usuarioAtualizado = await resp.json()
    setUsuarios(prev =>
      prev.map(u => (u.id === editando.id ? usuarioAtualizado : u))
    )
    setEditando(null)
  } catch (e) {
    setUsuarios(backup) // rollback
    setErro(e.message)
  }
}

/////criar usuario////

async function criarUsuario(e) {
  e.preventDefault()
  const backup = usuarios
  setErro(null)

  try {
    const resp = await fetch('https://jsonplaceholder.typicode.com/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoUsuario)
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

    const criado = await resp.json()
    setUsuarios(prev => [...prev, criado])
    setNovoUsuario(null)
  } catch (e) {
    setUsuarios(backup)
    setErro(e.message)
  }
}



  if (carregando) return <p>Carregando...</p>
  if (erro && usuarios.length === 0)     return <p>Erro: {erro}</p>
  if (usuarios.length === 0) return <p>Nenhum usuário encontrado.</p>

  return ( 
    //{usuarios.length === 0 && !carregando && !erro && ( 
    //<p>Nenhum usuário cadastrado ainda.</p>
    //)}
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