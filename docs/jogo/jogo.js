(async function () {
  'use strict';

  const config = window.JOGO_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  document.title = config.nome || 'Quizuruto';
  $('titulo').textContent = config.nome || 'Quizuruto';
  if (config.cor) {
    document.documentElement.style.setProperty('--cor', config.cor);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', config.cor);
  }

  PlacarUI.montar($('painel-placar'));
  const progresso = await Placar.iniciar();
  $('melhor').textContent = progresso.melhor;
  Placar.aoMudar((p) => { $('melhor').textContent = p.melhor; });

  let estado = null;
  let prazo = 0;
  let relogio = null;
  let proximaAcao = null;
  let encerrando = false;

  function mostrar(tela) {
    ['tela-inicio', 'tela-jogo', 'tela-fim'].forEach((id) => { $(id).hidden = id !== tela; });
  }

  function limparRelogios() {
    clearInterval(relogio);
    clearTimeout(proximaAcao);
  }

  function atualizarTempo() {
    if (!estado || encerrando) return;
    const restante = Math.max(0, prazo - performance.now());
    $('tempo').textContent = String(Math.ceil(restante / 1000));
    $('barra-tempo').style.width = `${(restante / Regras.TEMPO_POR_PERGUNTA_MS) * 100}%`;
    if (restante <= 0) responder(null, true);
  }

  function mostrarPergunta() {
    if (estado.terminou) return terminar();
    const pergunta = Regras.perguntaAtual(estado);
    $('progresso').textContent = `Pergunta ${estado.indice + 1} de ${Regras.TOTAL_PERGUNTAS}`;
    $('pergunta').textContent = pergunta.pergunta;
    $('retorno').textContent = '';
    const alternativas = $('alternativas');
    alternativas.replaceChildren();
    pergunta.alternativas.forEach((texto, indice) => {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'alternativa';
      botao.textContent = `${String.fromCharCode(65 + indice)}. ${texto}`;
      botao.addEventListener('click', () => responder(indice, false));
      alternativas.appendChild(botao);
    });
    prazo = performance.now() + Regras.TEMPO_POR_PERGUNTA_MS;
    atualizarTempo();
    clearInterval(relogio);
    relogio = setInterval(atualizarTempo, 100);
    alternativas.querySelector('button')?.focus({ preventScroll: true });
  }

  function responder(indice, expirou) {
    if (!estado || encerrando || $('tela-jogo').hidden) return;
    const segundos = expirou ? 0 : Math.max(0, (prazo - performance.now()) / 1000);
    const resposta = Regras.responder(estado, indice, segundos);
    if (!resposta.resultado) return;
    estado = resposta.estado;
    clearInterval(relogio);
    const botoes = [...$('alternativas').querySelectorAll('button')];
    botoes.forEach((botao, i) => {
      botao.disabled = true;
      if (i === resposta.resultado.correta) botao.classList.add('correta');
      if (i === indice && !resposta.resultado.acertou) botao.classList.add('errada');
    });
    $('retorno').textContent = expirou
      ? `Tempo esgotado. ${resposta.resultado.explicacao}`
      : `${resposta.resultado.acertou ? `Acertou! +${resposta.resultado.pontosGanhos} pontos. ` : 'Quase! '} ${resposta.resultado.explicacao}`;
    if (estado.terminou) {
      proximaAcao = setTimeout(terminar, 1100);
    } else {
      proximaAcao = setTimeout(mostrarPergunta, 1100);
    }
  }

  async function terminar() {
    if (encerrando) return;
    encerrando = true;
    limparRelogios();
    $('resultado').textContent = estado.pontos;
    $('titulo-fim').textContent = estado.acertos === Regras.TOTAL_PERGUNTAS ? 'Missão perfeita!' : 'Missão concluída!';
    $('resumo').textContent = `Você acertou ${estado.acertos} de ${Regras.TOTAL_PERGUNTAS} perguntas.`;
    $('situacao-salvamento').textContent = 'Salvando pontuação...';
    mostrar('tela-fim');
    try {
      const salvo = await Placar.registrarPartida(estado.pontos, { acertos: estado.acertos });
      $('situacao-salvamento').textContent = Placar.modo() === 'nuvem' && !salvo.salvoNaNuvem
        ? 'Pontuação salva neste aparelho. Entre com apelido e PIN para enviar ao ranking.'
        : 'Pontuação salva!';
    } catch (erro) {
      $('situacao-salvamento').textContent = `Não deu para salvar: ${erro.message}`;
    }
  }

  function comecar() {
    limparRelogios();
    estado = Regras.novaPartida();
    encerrando = false;
    mostrar('tela-jogo');
    mostrarPergunta();
  }

  $('botao-jogar').addEventListener('click', comecar);
  $('botao-de-novo').addEventListener('click', comecar);
  mostrar('tela-inicio');
})();
