# PaySeguro Carteira Digital — Dossiê de Arquitetura & Teorema CAP

> **Desafio de Arquitetura de Software — Grupo 3**  
> *Bancos de Dados NoSQL e Trade-offs do Teorema CAP: MongoDB (CP) vs. Apache Cassandra (AP)*

---

## 📌 Visão Geral do Projeto

Este projeto consiste na landing page técnica interativa e responsiva desenvolvida para a diretoria executiva e equipe de engenharia da **PaySeguro Carteira Digital**. 

O objetivo é apresentar a resposta definitiva à crise de infraestrutura decorrente do rompimento de fibra óptica inter-datacenters, demonstrando através da teoria e de um simulador interativo em tempo real como o **Teorema CAP** governa a decisão de arquitetura:
1. **Saldos Bancários (Transacional / Pix):** Implementado no perfil **CP** via **MongoDB Enterprise** (Replica Sets com Write Concern `majority` e Read Concern `linearizable`).
2. **Feed de Notificações do App (Push / UX):** Implementado no perfil **AP** via **Apache Cassandra** (Arquitetura Masterless Peer-to-Peer com `LOCAL_QUORUM`).

---

## 🧱 Estrutura de Arquivos

```
PaySeguro/
├── index.html           # Estrutura HTML5 semântica e cards explicativos
├── src/
│   ├── css/
│   │   └── styles.css       # Design System Fintech Dark Mode, animações e responsividade
│   └── js/
│       └── app.js           # Lógica do Simulador CAP e console de telemetria
├── Dockerfile           # Imagem base Nginx Alpine para produção estática
├── nginx.conf           # Configuração de rotas, cache e security headers
├── docker-compose.yml   # Orquestração do container Nginx (porta 8080)
└── README.md            # Documentação técnica
```

---

## 🚀 Como Executar

### Opção 1: Diretamente no Navegador (Sem Instalação)
Basta dar um duplo clique no arquivo [`index.html`](file:///c:/Users/arthu/OneDrive/Desktop/estudos/PaySeguro/index.html) ou abri-lo pelo seu navegador favorito (Chrome, Firefox, Edge, Safari). Não requer nenhum passo de compilação ou bundler.

### Opção 2: Via Docker / Docker Compose
Para rodar a aplicação em um servidor web real Nginx conteinerizado:

```bash
# Na raiz do projeto:
docker-compose up -d --build
```

Acesse no navegador:
👉 **`http://localhost:8080`**

Para parar o container:
```bash
docker-compose down
```

---

## 🎯 Seções e Recursos da Aplicação

1. **Hero Section & KPIs Executivos:** Indicadores rápidos do incidente, tecnologias selecionadas e status geral.
2. **Diagnóstico da Crise (Post-Mortem):** Análise forense do rompimento físico de fibra entre os datacenters SP-01 e RJ-01 e os impactos do legado com inconsistência eventual cega (risco de *double spending*).
3. **Teorema CAP Explicado à Diretoria:** Decomposição didática de Consistência (C), Disponibilidade (A) e Tolerância a Partição (P). Inclui **diagrama interativo dinâmico** permitindo alternar entre perfis CP, AP e a ilusão CA.
4. **Decisão 1 (Saldos Bancários):** Foco em **CP com MongoDB**. Explicação de consenso via Raft, primariedade estrita, write concern `w: "majority"` e exemplo de código executivo.
5. **Decisão 2 (Feed de Notificações):** Foco em **AP com Apache Cassandra**. Explicação da topologia Masterless em anel, ausência de SPOF, tunable consistency (`LOCAL_QUORUM`) e DDL CQL multi-datacenter.
6. **Matriz de Decisão Comparativa:** Tabela técnica e de negócio consolidada comparando os trade-offs e impactos operacionais.
7. **Simulador Interativo de Partição de Rede:** 
   - Interruptor para **romper ou restabelecer a fibra óptica**.
   - Visualização gráfica da topologia e animação de quebra de enlace.
   - Diagnóstico simultâneo automático: **MongoDB bloqueia escritas minoritárias** (proteção contra saldo fantasma) enquanto **Cassandra continua aceitando notificações** normalmente.
   - Disparador de transações Pix e notificações com **Console de Telemetria ao Vivo** registrando logs de eventos e exceções.

---

## 👥 Autoria
- **Grupo 3 • Engenharia e Arquitetura de Software**
- Especialização em Bancos NoSQL & Computação Distribuída
