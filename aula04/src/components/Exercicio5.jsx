import { useEffect, useState } from 'react'
import { apiGet, mensagemDeErro } from '../api'

export default function Exercicio5() {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const controle = new AbortController()
    const signal = controle.signal

    async function buscar() {
      try {
        setCarregando(true)
        setErro(null)

        await new Promise(resolve => setTimeout(resolve, 1500))

        const data = await apiGet('/users', { signal })
        setItens(data)
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

  let mensagem
  if (carregando) {
    mensagem = 'Carregando...'
  } else if (erro) {
    mensagem = `Erro: ${erro}`
  } else if (itens.length === 0) {
    mensagem = 'Nenhum item encontrado.'
  } else {
    mensagem = `Sucesso: ${itens.length} itens carregados.`
  }

  return <p>{mensagem}</p>
}