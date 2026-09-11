/* =========================================
   B.Uman · btalk.js
   Fluxo guiado por nós + envio para WhatsApp da Eli
   Versão de produção (com fallback de IA)
   ========================================= */

(() => {
  'use strict';

  const body  = document.getElementById('chatBody');
  const quick = document.getElementById('chatQuick');
  const form  = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  if (!body) return;

  const WHATSAPP = '351939097476'; // Eli Colles
  const AI_BACKEND_URL = 'https://SEU-BACKEND-AQUI.com/chat'; // troca pelo URL real do backend Python

  /* =========================================================
     1) ÁRVORE DE NÓS
     ========================================================= */
  const FLOW = {

    inicio: {
      msg: 'Olá 👋 Sou a assistente da B.Uman. Em que posso ajudar-te hoje?',
      options: [
        { label: 'Resolver burocracia',    next: 'resolver' },
        { label: 'Desabafar (B.Talk)',     next: 'btalk_info' },
        { label: 'Cuidar (Kôbido)',        next: 'kobido_tipo' },
        { label: 'Não sei o que preciso',  next: 'indeciso' }
      ]
    },

    resolver: {
      msg: 'Certo. A burocracia tem dois níveis. Qual se parece mais contigo?',
      options: [
        { label: 'Só preciso saber o que fazer (19€)', next: 'bquick_info' },
        { label: 'Quero que tratem por mim (29€)',     next: 'bguidance_info' },
        { label: 'Não sei — explica-me',               next: 'resolver_explica' }
      ]
    },

    resolver_explica: {
      msg: 'B.Quick é uma triagem: dizes-me o problema, eu digo-te o que fazer, onde ir e qual o próximo passo (19€).\n\nB.Guidance é serviço completo: trato da papelada do início ao fim, com até 3 contactos por processo (29€).\n\nQual faz mais sentido?',
      options: [
        { label: 'B.Quick (19€)',    next: 'bquick_info' },
        { label: 'B.Guidance (29€)', next: 'bguidance_info' },
        { label: 'Voltar',           next: 'resolver' }
      ]
    },

    bquick_info: {
      msg: '<strong>B.Quick · Decidir · 19€</strong><br><br>Triagem da situação, definição de prioridades e direcção imediata.<br>1 situação, 1 objectivo.<br><br>Vamos marcar?',
      options: [
        { label: 'Sim, quero marcar',   next: 'pedir_nome', service: 'B.Quick · Decidir · 19€' },
        { label: 'Ver outros serviços', next: 'servicos_todos' }
      ]
    },

    bguidance_info: {
      msg: '<strong>B.Guidance · Resolver · 29€</strong><br><br>Tratamento de papelada e processos administrativos do início ao fim.<br>Inclui até 3 trocas de email ou contactos telefónicos por processo.<br><br>Vamos marcar?',
      options: [
        { label: 'Sim, quero marcar',   next: 'pedir_nome', service: 'B.Guidance · Resolver · 29€' },
        { label: 'Ver outros serviços', next: 'servicos_todos' }
      ]
    },

    btalk_info: {
      msg: '<strong>B.Talk · Desabafar · 29€</strong><br><br>Sessão de 30 minutos para descomprimir, falar e ganhar clareza.<br>Escuta e conversa prática e humana, sem julgamento.<br><br>Não substitui terapia nem acompanhamento psicológico.<br><br>Queres marcar?',
      options: [
        { label: 'Sim, quero marcar',   next: 'pedir_nome', service: 'B.Talk · Desabafar · 29€' },
        { label: 'Ver outros serviços', next: 'servicos_todos' }
      ]
    },

    kobido_tipo: {
      msg: '<strong>B.Care · Ritual Kôbido</strong><br><br>Ritual facial japonês que alivia tensão, reduz sinais de stress e devolve leveza ao rosto e ao corpo.<br><br>Qual formato te interessa?',
      options: [
        { label: 'Express — 30 min — 39€',  next: 'pedir_nome', service: 'Kôbido Express · 30 min · 39€' },
        { label: 'Completa — 40 min — 49€', next: 'pedir_nome', service: 'Kôbido Completa · 40 min · 49€' },
        { label: 'Ao domicílio — 69€',      next: 'pedir_nome', service: 'Kôbido ao Domicílio · 69€' },
        { label: 'Voltar',                   next: 'inicio' }
      ]
    },

    indeciso: {
      msg: 'Sem problema 🌿 A B.Uman tem 4 caminhos. Diz-me qual te chama mais:',
      options: [
        { label: 'Tenho coisas bloqueadas para resolver', next: 'resolver' },
        { label: 'Preciso falar com alguém',               next: 'btalk_info' },
        { label: 'Preciso parar e cuidar de mim',          next: 'kobido_tipo' },
        { label: 'Quero saber mais sobre a Eli',           next: 'sobre' }
      ]
    },

    sobre: {
      msg: 'A B.Uman é um ponto de contacto humano para mulheres que carregam demasiado.<br><br>Trato do que está bloqueado, organizo o que está caótico e avanço contigo até estar feito.<br><br><em>by Eli Colles · 24+ anos de experiência</em>',
      options: [
        { label: 'Ver serviços', next: 'servicos_todos' },
        { label: 'Marcar',       next: 'inicio' }
      ]
    },

    servicos_todos: {
      msg: 'Estes são todos os serviços disponíveis 👇',
      options: [
        { label: 'B.Quick — 19€',       next: 'bquick_info' },
        { label: 'B.Guidance — 29€',    next: 'bguidance_info' },
        { label: 'B.Talk — 29€',        next: 'btalk_info' },
        { label: 'Kôbido — desde 39€',  next: 'kobido_tipo' }
      ]
    },

    pedir_nome: {
      msg: 'Boa ✅ Como te chamas?',
      input: 'name'
    },

    pedir_dia: {
      dynamic: (data) => `Prazer, <strong>${data.nome || ''}</strong> 🌿 Qual o melhor dia e hora para ti?`,
      input: 'datetime'
    },

    pedir_zona: {
      msg: 'Qual a tua zona? (necessário para Kôbido ao Domicílio)',
      input: 'zone'
    },

    resumo: {
      dynamic: (data) => {
        let txt = '<strong>Resumo da tua marcação</strong><br><br>';
        txt += `👤 Nome: ${data.nome || '—'}<br>`;
        txt += `✨ Serviço: ${data.servico || '—'}<br>`;
        if (data.dia)  txt += `📅 Quando: ${data.dia}<br>`;
        if (data.zona) txt += `📍 Zona: ${data.zona}<br>`;
        txt += '<br>Confirmas que está tudo certo?';
        return txt;
      },
      options: [
        { label: '📱 Abrir WhatsApp e enviar à Eli', next: 'enviar_whatsapp' },
        { label: '✏️ Corrigir dados',                next: 'reiniciar' }
      ]
    },

    enviar_whatsapp: {
      msg: 'A abrir o WhatsApp com os teus dados já preenchidos 📱<br><br>É só carregar em <strong>enviar</strong> e a Eli recebe logo.',
      action: 'whatsapp'
    },

    reiniciar: {
      msg: 'Sem problema. Vamos recomeçar 🌿',
      options: [
        { label: 'Voltar ao início', next: 'inicio' }
      ]
    }
  };

  /* =========================================================
     2) ESTADO
     ========================================================= */
  const state = {
    nome: null,
    servico: null,
    dia: null,
    zona: null,
    inputMode: null
  };

  /* =========================================================
     3) HELPERS
     ========================================================= */
  function addMsg(html, who = 'bot') {
    const div = document.createElement('div');
    div.className = `chat-msg ${who}`;
    div.innerHTML = html.replace(/\n/g, '<br>');
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
    return t;
  }

  function renderQuick(options = []) {
    quick.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => goTo(opt.next, opt.service));
      quick.appendChild(btn);
    });
  }

  // NOVO: chama o backend de IA (modelo Qwen2.5-0.5B-Portuguese) para perguntas fora do padrão
  async function askAI(text) {
    try {
      const resp = await fetch(AI_BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (!resp.ok) throw new Error('backend error');
      const data = await resp.json();
      return data.resposta || null;
    } catch (e) {
      return null; // backend indisponível → cai no fallback normal
    }
  }

  function openWhatsApp() {
    const linhas = [
      '🌿 *Nova marcação B.Uman*',
      '',
      `👤 Nome: ${state.nome || '—'}`,
      `✨ Serviço: ${state.servico || '—'}`,
      state.dia  ? `📅 Quando: ${state.dia}`  : null,
      state.zona ? `📍 Zona: ${state.zona}`   : null,
      '',
      '_Enviado pelo chat do site B.Uman_'
    ].filter(Boolean);

    const mensagem = encodeURIComponent(linhas.join('\n'));
    const url = `https://wa.me/${WHATSAPP}?text=${mensagem}`;

    try {
      const historico = JSON.parse(localStorage.getItem('buman_pedidos') || '[]');
      historico.push({
        data: new Date().toISOString(),
        nome: state.nome,
        servico: state.servico,
        dia: state.dia,
        zona: state.zona
      });
      localStorage.setItem('buman_pedidos', JSON.stringify(historico));
    } catch (e) { /* silencioso */ }

    const win = window.open(url, '_blank');

    if (!win || win.closed || typeof win.closed === 'undefined') {
      addMsg(
        'Não consegui abrir automaticamente 📱<br><br>' +
        `<a href="${url}" target="_blank" rel="noopener">👉 Clica aqui para abrir o WhatsApp</a>`,
        'bot'
      );
    } else {
      addMsg(
        `Se o WhatsApp não abrir sozinho, <a href="${url}" target="_blank" rel="noopener">clica aqui</a>. 🌿`,
        'bot'
      );
    }
  }

  /* =========================================================
     4) MOTOR DO FLUXO
     ========================================================= */
  function goTo(nodeId, serviceName) {
    const node = FLOW[nodeId];
    if (!node) return;

    if (typeof serviceName === 'string' && serviceName.trim()) {
      state.servico = serviceName;
    }

    const typing = showTyping();

    setTimeout(() => {
      typing.remove();

      const msgHTML = node.dynamic ? node.dynamic(state) : node.msg;
      if (msgHTML) addMsg(msgHTML, 'bot');

      if (node.input) {
        state.inputMode = node.input;
        quick.innerHTML = '';
        input.placeholder =
          node.input === 'name'     ? 'Escreve o teu nome...' :
          node.input === 'datetime' ? 'Ex.: Terça às 15h' :
          node.input === 'zone'     ? 'Ex.: Lisboa, Cascais...' :
          'Escreve a tua resposta...';
        input.focus();
        return;
      }

      if (node.action === 'whatsapp') {
        state.inputMode = null;
        renderQuick([{ label: 'Recomeçar', next: 'inicio' }]);
        setTimeout(openWhatsApp, 400);
        return;
      }

      state.inputMode = null;
      input.placeholder = 'Ou escreve uma pergunta...';
      if (node.options) renderQuick(node.options);
    }, 550);
  }

  /* =========================================================
     5) TEXTO LIVRE
     ========================================================= */
  // NOTA: função agora assíncrona para poder aguardar a resposta da IA
  async function handleFreeText(text) {
    addMsg(text, 'user');

    if (state.inputMode) {
      if (state.inputMode === 'name')     state.nome = text;
      if (state.inputMode === 'datetime') state.dia  = text;
      if (state.inputMode === 'zone')     state.zona = text;

      const mode = state.inputMode;
      state.inputMode = null;

      const typing = showTyping();
      setTimeout(() => {
        typing.remove();

        if (mode === 'name') {
          if (state.servico && state.servico.toLowerCase().includes('domicílio')) {
            goTo('pedir_zona');
          } else {
            goTo('pedir_dia');
          }
        } else {
          goTo('resumo');
        }
      }, 400);
      return;
    }

    const lower = text.toLowerCase();
    const match = (words) => words.some(w => lower.includes(w));

    if (match(['quick','decidir','19']))                    return goTo('bquick_info');
    if (match(['guidance','papelada','29']))                return goTo('bguidance_info');
    if (match(['talk','desabafar','conversa','falar']))     return goTo('btalk_info');
    if (match(['kôbido','kobido','cara','rosto','facial'])) return goTo('kobido_tipo');
    if (match(['preço','preco','quanto','custa','valor']))  return goTo('servicos_todos');
    if (match(['sobre','eli','quem é']))                    return goTo('sobre');
    if (match(['olá','ola','oi','bom dia','boa tarde']))    return goTo('inicio');
    if (match(['obrigad','thanks','ok','okay'])) {
      addMsg('Sempre 🌿 Se precisares de mais alguma coisa, é só escrever.', 'bot');
      renderQuick([{ label: 'Ver serviços', next: 'servicos_todos' }]);
      return;
    }

    // NOVO: pergunta fora do padrão → pede ajuda à IA antes de cair no fallback genérico
    const typing = showTyping();
    const respostaIA = await askAI(text);
    typing.remove();

    if (respostaIA) {
      addMsg(respostaIA, 'bot');
      renderQuick([
        { label: 'Ver serviços', next: 'servicos_todos' },
        { label: 'Marcar agora', next: 'inicio' },
        { label: 'Falar no WhatsApp', next: 'enviar_whatsapp' }
      ]);
      return;
    }

    addMsg('Ainda não percebi bem isso 🤔 mas posso ajudar-te assim:', 'bot');
    renderQuick([
      { label: 'Ver serviços', next: 'servicos_todos' },
      { label: 'Marcar agora', next: 'inicio' },
      { label: 'Falar no WhatsApp', next: 'enviar_whatsapp' }
    ]);
  }

  /* =========================================================
     6) EVENTOS
     ========================================================= */
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    handleFreeText(val);
  });

  window.addEventListener('buman:service', (e) => {
    const svc = e.detail || '';
    state.servico = svc;
    addMsg(`Quero marcar: <strong>${svc}</strong>`, 'user');

    const typing = showTyping();
    setTimeout(() => {
      typing.remove();
      addMsg('Perfeito ✅ Vamos tratar disso. Como te chamas?', 'bot');
      state.inputMode = 'name';
      quick.innerHTML = '';
      input.placeholder = 'Escreve o teu nome...';
      input.focus();
    }, 500);
  });

  /* =========================================================
     7) ARRANQUE
     ========================================================= */
  function init() {
    body.innerHTML = '';
    quick.innerHTML = '';
    state.nome = null;
    state.servico = null;
    state.dia = null;
    state.zona = null;
    state.inputMode = null;
    goTo('inicio');
  }

  init();

})();
