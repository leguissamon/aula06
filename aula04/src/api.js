// src/api.js

export const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Exercício 3: erro customizado com o status HTTP
export class ApiError extends Error {
  constructor(status, statusText) {
    super(statusText);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Função base: opcoes pode ter method, body, signal, headers extras...
async function requisicao(caminho, opcoes = {}) {
  const { headers: headersDaChamada, ...resto } = opcoes;

  const resp = await fetch(`${BASE_URL}${caminho}`, {
    ...resto,
    headers: {
      'Content-Type': 'application/json',
      ...headersDaChamada, // Exercício 5: merge de headers
    },
  });

  if (!resp.ok) {
    throw new ApiError(resp.status, resp.statusText);
  }

  if (resp.status === 204) return null;

  return resp.json();
}

export function apiGet(caminho, opcoes = {}) {
  return requisicao(caminho, { ...opcoes, method: 'GET' });
}

export function apiPost(caminho, dados, opcoes = {}) {
  return requisicao(caminho, {
    ...opcoes,
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function apiPut(caminho, dados, opcoes = {}) {
  return requisicao(caminho, {
    ...opcoes,
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export function apiDelete(caminho, opcoes = {}) {
  return requisicao(caminho, { ...opcoes, method: 'DELETE' });
}

// Exercício 3: traduz qualquer erro em mensagem para a tela
export function mensagemDeErro(err) {
  if (err instanceof ApiError) {
    if (err.status === 404) return 'Recurso não encontrado';
    if (err.status >= 500) return 'Erro no servidor';
    return `Erro ${err.status}`;
  }
  if (err instanceof TypeError) return 'Falha de rede';
  return 'Erro inesperado';
}