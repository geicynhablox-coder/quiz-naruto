import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const Regras = require('../docs/jogo/regras.js');

test('a partida tem dez perguntas com quatro alternativas', () => {
  const estado = Regras.novaPartida(() => 0.5);
  assert.equal(estado.perguntas.length, 10);
  assert.equal(Regras.TOTAL_PERGUNTAS, 10);
  assert.ok(estado.perguntas.every((p) => p.alternativas.length === 4));
});

test('embaralha usando o sorteio recebido e mantém todas as perguntas', () => {
  const original = Regras.novaPartida(() => 0.5).perguntas.map((p) => p.pergunta).sort();
  const embaralhada = Regras.novaPartida(() => 0).perguntas.map((p) => p.pergunta);
  assert.notDeepEqual(embaralhada, Regras.novaPartida(() => 0.5).perguntas.map((p) => p.pergunta));
  assert.deepEqual(embaralhada.slice().sort(), original);
});

test('acerto soma 100 pontos mais os segundos inteiros restantes', () => {
  const estado = Regras.novaPartida(() => 0.5);
  const pergunta = Regras.perguntaAtual(estado);
  const resposta = Regras.responder(estado, pergunta.correta, 8.9);
  assert.equal(resposta.resultado.acertou, true);
  assert.equal(resposta.resultado.pontosGanhos, 108);
  assert.equal(resposta.estado.pontos, 108);
  assert.equal(resposta.estado.acertos, 1);
});

test('resposta errada não pontua e conta como erro', () => {
  const estado = Regras.novaPartida(() => 0.5);
  const pergunta = Regras.perguntaAtual(estado);
  const resposta = Regras.responder(estado, (pergunta.correta + 1) % 4, 12);
  assert.equal(resposta.resultado.acertou, false);
  assert.equal(resposta.estado.pontos, 0);
  assert.equal(resposta.estado.erros, 1);
  assert.ok(resposta.resultado.explicacao.length > 0);
});

test('tempo esgotado não pontua mesmo se a alternativa estiver certa', () => {
  const estado = Regras.novaPartida(() => 0.5);
  const correta = Regras.perguntaAtual(estado).correta;
  const resposta = Regras.responder(estado, correta, 0);
  assert.equal(resposta.resultado.acertou, false);
  assert.equal(resposta.estado.pontos, 0);
});

test('a décima resposta encerra a partida', () => {
  let estado = Regras.novaPartida(() => 0.5);
  for (let i = 0; i < 9; i++) {
    const pergunta = Regras.perguntaAtual(estado);
    estado = Regras.responder(estado, pergunta.correta, 15).estado;
    assert.equal(estado.terminou, false);
  }
  const pergunta = Regras.perguntaAtual(estado);
  const resultado = Regras.responder(estado, pergunta.correta, 15);
  assert.equal(resultado.estado.terminou, true);
  assert.equal(resultado.estado.indice, 10);
  assert.equal(resultado.estado.pontos, 1150);
});

test('não permite responder de novo depois do fim', () => {
  const estado = Regras.novaPartida(() => 0.5);
  const terminada = { ...estado, terminou: true };
  const resposta = Regras.responder(terminada, 0, 10);
  assert.equal(resposta.resultado, null);
  assert.equal(resposta.estado, terminada);
  assert.equal(Regras.perguntaAtual(terminada), null);
});
