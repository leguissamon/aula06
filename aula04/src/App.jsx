import ListaUsuarios from "./components/ListaUsuarios";

import Exercicio5 from "./components/Exercicio5";

export default function App(){
  return(
    <>
      <section>
        <h1>Exercícios 1, 2, 3 e 4</h1>
        <p>Para testar o erro 404, troque /users por /testehttp no apiGet</p>
        <ListaUsuarios/>
      </section>

      <section>
        <h1>Exercício 5</h1>
        <Exercicio5/>
      </section>
    </>
  )
}