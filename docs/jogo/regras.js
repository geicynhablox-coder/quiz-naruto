/* Regras puras do Quizuruto. O gerador de sorteio entra por parâmetro nos testes. */
(function (raiz, fabrica) {
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.Regras = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const TEMPO_POR_PERGUNTA_MS = 15000;
  const BANCO = [
    { pergunta: 'Qual é o sonho de Naruto?', alternativas: ['Virar Hokage', 'Ser um samurai', 'Encontrar um tesouro', 'Virar kazekage'], correta: 0, explicacao: 'Naruto quer se tornar Hokage e ser reconhecido pela Vila da Folha.' },
    { pergunta: 'Em qual vila Naruto cresceu?', alternativas: ['Vila da Areia', 'Vila da Folha', 'Vila da Névoa', 'Vila da Pedra'], correta: 1, explicacao: 'Naruto cresceu em Konohagakure, a Vila Oculta da Folha.' },
    { pergunta: 'Quem foi o primeiro professor de Naruto na Academia?', alternativas: ['Kakashi', 'Jiraiya', 'Iruka', 'Asuma'], correta: 2, explicacao: 'Iruka foi o professor que acreditou em Naruto desde o começo.' },
    { pergunta: 'Como se chama o time de Naruto, Sakura e Sasuke?', alternativas: ['Time 7', 'Time 3', 'Time Hebi', 'Time Guy'], correta: 0, explicacao: 'Naruto, Sakura e Sasuke formam o Time 7, liderado por Kakashi.' },
    { pergunta: 'Qual é o nome da raposa de nove caudas?', alternativas: ['Shukaku', 'Kurama', 'Gyuki', 'Matatabi'], correta: 1, explicacao: 'Kurama é a Raposa de Nove Caudas selada dentro de Naruto.' },
    { pergunta: 'Qual técnica Naruto usa para criar cópias de si mesmo?', alternativas: ['Chidori', 'Byakugan', 'Rasengan', 'Kage Bunshin no Jutsu'], correta: 3, explicacao: 'Kage Bunshin no Jutsu é a Técnica dos Clones das Sombras.' },
    { pergunta: 'Quem é o irmão mais velho de Sasuke?', alternativas: ['Madara', 'Shisui', 'Itachi', 'Obito'], correta: 2, explicacao: 'Itachi é o irmão mais velho de Sasuke.' },
    { pergunta: 'Qual é o nome da equipe liderada por Might Guy?', alternativas: ['Time 8', 'Time 10', 'Time 7', 'Time Guy'], correta: 3, explicacao: 'A equipe de Rock Lee, Neji e Tenten é conhecida como Time Guy.' },
    { pergunta: 'Qual é o clã de Hinata?', alternativas: ['Nara', 'Hyuga', 'Akimichi', 'Aburame'], correta: 1, explicacao: 'Hinata faz parte do clã Hyuga, conhecido pelo Byakugan.' },
    { pergunta: 'Qual exame reúne jovens ninjas de várias vilas?', alternativas: ['Exame Chunin', 'Prova Hokage', 'Torneio dos Sannin', 'Desafio Anbu'], correta: 0, explicacao: 'O Exame Chunin testa as habilidades e o trabalho em equipe dos genin.' }
  ];

  function embaralhar(itens, sorteio) {
    const resultado = itens.slice();
    const aleatorio = sorteio || Math.random;
    for (let i = resultado.length - 1; i > 0; i--) {
      const j = Math.floor(aleatorio() * (i + 1));
      [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
  }

  function novaPartida(sorteio) {
    return { perguntas: embaralhar(BANCO, sorteio), indice: 0, pontos: 0, acertos: 0, erros: 0, terminou: false };
  }

  function perguntaAtual(estado) {
    return estado && !estado.terminou ? estado.perguntas[estado.indice] || null : null;
  }

  function responder(estado, alternativa, segundosRestantes) {
    if (!estado || estado.terminou || !perguntaAtual(estado)) return { estado, resultado: null };
    const pergunta = perguntaAtual(estado);
    const acertou = Number.isInteger(alternativa) && alternativa === pergunta.correta && segundosRestantes > 0;
    const segundos = Math.max(0, Math.floor(Number(segundosRestantes) || 0));
    const proximo = Object.assign({}, estado, {
      indice: estado.indice + 1,
      pontos: estado.pontos + (acertou ? 100 + segundos : 0),
      acertos: estado.acertos + (acertou ? 1 : 0),
      erros: estado.erros + (acertou ? 0 : 1)
    });
    if (proximo.indice >= proximo.perguntas.length) proximo.terminou = true;
    return {
      estado: proximo,
      resultado: { acertou, explicacao: pergunta.explicacao, correta: pergunta.correta, pontosGanhos: acertou ? 100 + segundos : 0 }
    };
  }

  return { TOTAL_PERGUNTAS: BANCO.length, TEMPO_POR_PERGUNTA_MS, embaralhar, novaPartida, perguntaAtual, responder };
});
