/**
 * PAYSEGURO CARTEIRA DIGITAL — CONTROLADOR FRONTEND
 * Interatividade do Teorema CAP & Simulador de Partição de Rede
 * Grupo 3 • Arquitetura de Software NoSQL
 */

document.addEventListener('DOMContentLoaded', () => {
  initCapExplainer();
  initNetworkSimulator();
});

/* ==========================================================================
   1. MÓDULO INTERATIVO: TEOREMA CAP (SELETOR DE TRADE-OFF)
   ========================================================================== */
function initCapExplainer() {
  const btnCp = document.getElementById('btn-mode-cp');
  const btnAp = document.getElementById('btn-mode-ap');
  const btnCa = document.getElementById('btn-mode-ca');
  const canvas = document.getElementById('cap-canvas-display');

  if (!canvas) return;

  const modes = {
    cp: {
      badge: 'Modelo CP • Consistência + Tolerância a Partição',
      badgeClass: 'cp',
      title: 'Prioridade: Correção dos Dados (Fail-Closed)',
      desc: 'Havendo corte do link de rede (P), o sistema isola ou bloqueia os nós que não formam quórum de maioria. As requisições que poderiam ler ou gravar dados defasados são rejeitadas. Ideal para Saldos Bancários e Pix: dinheiro nunca mente.',
      nodeA: { name: 'DC Maioria', status: 'Ativo (Quórum)', class: 'node-a' },
      nodeB: { name: 'DC Minoria', status: 'Bloqueado', class: 'node-b' },
      linkClass: 'broken',
      linkLabel: 'Rede Particionada (P)'
    },
    ap: {
      badge: 'Modelo AP • Disponibilidade + Tolerância a Partição',
      badgeClass: 'ap',
      title: 'Prioridade: Continuidade do Serviço (Always Available)',
      desc: 'Havendo corte do link de rede (P), ambos os polos continuam atendendo requisições e aceitando escritas localmente. Aceita-se que temporariamente os dados divirjam até que o cabo seja reconectado. Ideal para Feeds, Notificações e Timelines.',
      nodeA: { name: 'DC SP', status: 'Disponível (Local)', class: 'node-a' },
      nodeB: { name: 'DC RJ', status: 'Disponível (Local)', class: 'node-b' },
      linkClass: 'broken',
      linkLabel: 'Rede Particionada (P)'
    },
    ca: {
      badge: 'Modelo CA • Consistência + Disponibilidade (Sem P)',
      badgeClass: 'ca',
      title: 'O Mito do "CA" em Ambientes Multi-Datacenter',
      desc: 'Sistemas CA só existem se a rede for 100% à prova de falhas (um único servidor monolítico). Em arquiteturas distribuídas e em nuvem, a partição (P) é uma inevitabilidade física. Se a rede rompe, você é FORÇADO a escolher entre C ou A.',
      nodeA: { name: 'Servidor 1', status: 'Operando', class: 'node-a' },
      nodeB: { name: 'Servidor 2', status: 'Operando', class: 'node-b' },
      linkClass: 'solid',
      linkLabel: 'Rede Teórica Sem Falhas'
    }
  };

  function renderMode(modeKey) {
    const data = modes[modeKey];
    canvas.innerHTML = `
      <div class="cap-state-view">
        <div class="cap-diagram-art">
          <div class="diagram-nodes-wrap">
            <div class="d-node ${data.nodeA.class}">
              <span>${data.nodeA.name}</span>
              <small style="font-size: 0.65rem; opacity: 0.85;">${data.nodeA.status}</small>
            </div>
            <div class="d-link-line ${data.linkClass}"></div>
            <div class="d-node ${data.nodeB.class}">
              <span>${data.nodeB.name}</span>
              <small style="font-size: 0.65rem; opacity: 0.85;">${data.nodeB.status}</small>
            </div>
          </div>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">
            Link Inter-Região: <strong>${data.linkLabel}</strong>
          </span>
        </div>

        <div class="cap-state-details">
          <span class="state-badge-tag ${data.badgeClass}">${data.badge}</span>
          <h4>${data.title}</h4>
          <p>${data.desc}</p>
        </div>
      </div>
    `;

    // Atualizar estados dos botões
    [btnCp, btnAp, btnCa].forEach(btn => btn?.classList.remove('active'));
    if (modeKey === 'cp') btnCp?.classList.add('active');
    if (modeKey === 'ap') btnAp?.classList.add('active');
    if (modeKey === 'ca') btnCa?.classList.add('active');
  }

  btnCp?.addEventListener('click', () => renderMode('cp'));
  btnAp?.addEventListener('click', () => renderMode('ap'));
  btnCa?.addEventListener('click', () => renderMode('ca'));

  // Estado inicial
  renderMode('cp');
}

/* ==========================================================================
   2. MÓDULO INTERATIVO: SIMULADOR DE PARTIÇÃO DE REDE
   ========================================================================== */
function initNetworkSimulator() {
  const switchInput = document.getElementById('partition-switch');
  const stateLabel = document.getElementById('toggle-state-label');
  const stateDesc = document.getElementById('toggle-state-desc');

  // Topologia
  const dcRjStatus = document.getElementById('dc-rj-status');
  const cableLine = document.getElementById('cable-line');
  const cableBadge = document.getElementById('cable-badge');
  const cableStatusText = document.getElementById('cable-status-text');
  
  // Nós
  const mongoRjRole = document.getElementById('mongo-rj-role');
  const mongoRjDesc = document.getElementById('mongo-rj-desc');

  // Painéis de Resultados
  const resultMongo = document.getElementById('result-mongo');
  const mongoHeadline = document.getElementById('mongo-card-headline');
  const mongoBody = document.getElementById('mongo-card-body');
  const mongoMetricTag = document.getElementById('mongo-metric-tag');

  const resultCassandra = document.getElementById('result-cassandra');
  const cassHeadline = document.getElementById('cass-card-headline');
  const cassBody = document.getElementById('cass-card-body');
  const cassMetricTag = document.getElementById('cass-metric-tag');

  // Console de Logs
  const consoleLogs = document.getElementById('console-logs');
  const btnClearLogs = document.getElementById('btn-clear-logs');
  const btnTestPix = document.getElementById('btn-test-pix');
  const btnTestFeed = document.getElementById('btn-test-feed');
  const btnResetSim = document.getElementById('btn-reset-sim');

  let isPartitioned = false;

  function appendLog(type, origin, message) {
    if (!consoleLogs) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-origin">[${origin}]</span>
      <span>${message}</span>
    `;
    consoleLogs.appendChild(line);
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
  }

  function applySimulationState(partitionActive) {
    isPartitioned = partitionActive;

    if (partitionActive) {
      // 1. Atualizar controles
      if (stateLabel) stateLabel.textContent = 'Estado da Rede: PARTIÇÃO ATIVA (Fibra Óptica Rompida)';
      if (stateLabel) stateLabel.style.color = '#ef4444';
      if (stateDesc) stateDesc.textContent = 'Isolamento completo entre DC SP-01 e DC RJ-01. Pacotes TCP descartados.';

      // 2. Cabo e link
      cableLine?.classList.add('severed');
      cableBadge?.classList.add('severed');
      if (cableStatusText) cableStatusText.textContent = 'FIBRA ROMPIDA (Link Offline)';

      // 3. DC RJ Minoria
      if (dcRjStatus) {
        dcRjStatus.textContent = 'ISOLADO DA MAIORIA';
        dcRjStatus.className = 'dc-status-pill isolated';
      }
      if (mongoRjRole) {
        mongoRjRole.textContent = 'SECONDARY [DESCONECTADO DO QUÓRUM]';
        mongoRjRole.className = 'node-role role-demoted';
      }
      if (mongoRjDesc) {
        mongoRjDesc.textContent = 'Escritas bloqueadas para evitar divergência de saldo';
      }

      // 4. Card MongoDB (CP)
      resultMongo?.classList.add('blocked');
      if (mongoHeadline) {
        mongoHeadline.textContent = 'MongoDB (CP): Escrita Rejeitada em Nós Minoritários';
        mongoHeadline.style.color = '#ef4444';
      }
      if (mongoBody) {
        mongoBody.innerHTML = `
          <strong>Bloqueado temporariamente para escrita em nós minoritários para preservar saldo exato (Zero risco de saldo fantasma).</strong>
          Qualquer transação que atinja nós no Rio de Janeiro sem comunicação com o quórum em SP falha imediatamente com 
          <code>WriteConcernException</code>. O saldo bancário permanece protegido contra double spending.
        `;
      }
      if (mongoMetricTag) {
        mongoMetricTag.textContent = 'Status: Proteção Ativa (Fail-Closed)';
        mongoMetricTag.style.color = '#ef4444';
      }

      // 5. Card Cassandra (AP)
      resultCassandra?.classList.remove('blocked');
      if (cassHeadline) {
        cassHeadline.textContent = 'Cassandra (AP): Operação Ininterrupta (Local Quorum)';
        cassHeadline.style.color = '#06b6d4';
      }
      if (cassBody) {
        cassBody.innerHTML = `
          <strong>Operando normalmente com consistência eventual (Zero indisponibilidade para o usuário).</strong>
          Notificações e pushes continuam sendo gravados e entregues localmente em ambos os data centers. 
          As réplicas em RJ-01 gravam em disco local e enfileiram mutações para reconciliação automática via <em>Hinted Handoff</em>.
        `;
      }
      if (cassMetricTag) {
        cassMetricTag.textContent = 'Status: 100% Uptime (Disponibilidade Contínua)';
        cassMetricTag.style.color = '#06b6d4';
      }

      // 6. Logs de telemetria
      appendLog('danger', 'NET_ROUTER', 'ALERTA NÍVEL 1: Enlace interestadual de fibra óptica interrompido!');
      appendLog('warn', 'MONGO_RAFT', 'Perda de batimento cardíaco (heartbeat) de 2 nós réplicas no DC RJ-01.');
      appendLog('danger', 'MONGO_CP', 'Nós no RJ-01 rebaixados: ESCRITAS DE SALDO BLOQUEADAS para proteção de quórum.');
      appendLog('success', 'CASS_AP', 'Cassandra cluster entrou em modo multi-DC particionado: escritas com LOCAL_QUORUM continuam normais.');

    } else {
      // Estado Normal (Recuperado)
      if (stateLabel) {
        stateLabel.textContent = 'Estado da Rede: Link Operacional (Normal)';
        stateLabel.style.color = '#ffffff';
      }
      if (stateDesc) stateDesc.textContent = 'Datacenters SP-01 e RJ-01 comunicando-se com latência < 8ms.';

      cableLine?.classList.remove('severed');
      cableBadge?.classList.remove('severed');
      if (cableStatusText) cableStatusText.textContent = 'Fibra Óptica 100Gbps Ativa';

      if (dcRjStatus) {
        dcRjStatus.textContent = 'ONLINE (2 Nós)';
        dcRjStatus.className = 'dc-status-pill online';
      }
      if (mongoRjRole) {
        mongoRjRole.textContent = 'SECONDARY [Réplica Sincronizada]';
        mongoRjRole.className = 'node-role role-secondary';
      }
      if (mongoRjDesc) {
        mongoRjDesc.textContent = 'Sincronizado continuamente via Oplog';
      }

      resultMongo?.classList.remove('blocked');
      if (mongoHeadline) {
        mongoHeadline.textContent = 'Operação Normal: Consistência Forte Garantida';
        mongoHeadline.style.color = '#ffffff';
      }
      if (mongoBody) {
        mongoBody.textContent = 'Gravações transacionais ocorrendo com replicação síncrona na maioria dos nós. Nenhum risco de duplicidade de saldo detectado.';
      }
      if (mongoMetricTag) {
        mongoMetricTag.textContent = 'Status: 100% Consistente';
        mongoMetricTag.style.color = '#10b981';
      }

      if (cassHeadline) {
        cassHeadline.textContent = 'Operação Normal: Alta Disponibilidade Ativa';
        cassHeadline.style.color = '#ffffff';
      }
      if (cassBody) {
        cassBody.textContent = 'Nós atendem notificações push sem bloqueios. Mutações são gravadas localmente e replicadas em background.';
      }
      if (cassMetricTag) {
        cassMetricTag.textContent = 'Status: 100% Disponível';
        cassMetricTag.style.color = '#06b6d4';
      }

      appendLog('info', 'NET_MONITOR', 'Enlace de fibra óptica restabelecido. Latência inter-DC: 4.8ms.');
      appendLog('success', 'MONGO_REPL', 'Oplog sincronizado entre SP-01 e RJ-01. Quórum de 5 nós recomposto.');
      appendLog('info', 'CASS_GOSSIP', 'Hinted Handoff concluído: mutações pendentes sincronizadas no anel peer-to-peer.');
    }
  }

  // Event Listeners
  switchInput?.addEventListener('change', (e) => {
    applySimulationState(e.target.checked);
  });

  btnTestPix?.addEventListener('click', () => {
    const valor = (Math.random() * 200 + 50).toFixed(2);
    if (isPartitioned) {
      appendLog('danger', 'WALLET_SVC', `TENTATIVA PIX (R$ ${valor}) via nó do RJ: [FALHA CP INTENCIONAL] WriteConcernException: Quorum insuficiente. Transação abortada para evitar saldo fantasma.`);
    } else {
      appendLog('success', 'WALLET_SVC', `PIX (R$ ${valor}) EXECUTADO: Gravado no Primary SP-01 e replicado na maioria dos nós (w: majority). Saldo consistente.`);
    }
  });

  btnTestFeed?.addEventListener('click', () => {
    const pushMsgs = [
      'Seu cashback de R$ 12,50 caiu na conta!',
      'Você recebeu uma nova chave Pix cadastrada.',
      'Oferta especial: 10% off em parceiros PaySeguro.',
      'Comprovante de pagamento disponível.'
    ];
    const msg = pushMsgs[Math.floor(Math.random() * pushMsgs.length)];

    if (isPartitioned) {
      appendLog('success', 'NOTIF_SVC', `PUSH ENVIADO: "${msg}" gravado via Cassandra LOCAL_QUORUM. Zero indisponibilidade mesmo com fibra partida!`);
    } else {
      appendLog('info', 'NOTIF_SVC', `PUSH ENVIADO: "${msg}" propagado instantaneamente para todos os datacenters.`);
    }
  });

  btnClearLogs?.addEventListener('click', () => {
    if (consoleLogs) {
      consoleLogs.innerHTML = '';
      appendLog('info', 'SYS_CONSOLE', 'Console de telemetria reinicializado.');
    }
  });

  btnResetSim?.addEventListener('click', () => {
    if (switchInput) {
      switchInput.checked = false;
      applySimulationState(false);
    }
  });
}
