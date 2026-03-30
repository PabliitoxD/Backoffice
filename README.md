# Backoffice System

Este repositório contém o código-fonte do Sistema de Backoffice Administrativo, servindo como painel central para gestão de clientes, operações financeiras e segurança de acessos.

O projeto é dividido em dois serviços principais:
- **Frontend:** Desenvolvido em Next.js (versão 15) com React. Provê a interface visual administrativa (Dashboard, Configurações, Extratos).
- **Backend:** Desenvolvido em Nest.js, utilizando Prisma ORM para gestão do banco de dados PostgreSQL. Centraliza a regra de negócio, integração via API e controle de auditoria.

---

## Regras de Negócio e Entidades Principais

O sistema foi arquitetado em torno dos seguintes domínios fundamentais:

### 1. Gestão Operacional e Cadastros
- **Produtores (`Producer`):** Entidade foco do negócio. Representa parceiros, empresas ou autônomos que oferecem serviços processados na nossa plataforma. Cada produtor possui status ativo/inativo, documentos e contato.
- **Clientes / Compradores (`Customer`):** Indivíduos ou empresas que adquirem os produtos/serviços oferecidos pelos produtores.
- **Produtos (`Product`):** Itens cadastrados vinculados a um **Produtor** específico, servindo de base para o registro de transações financeiras.

### 2. Fluxo Financeiro e Vendas
- **Transações (`Transaction`):** Representam vendas ou operações aprovadas. Elas amarram o Produtor, Cliente e o Produto com o valor e o método de pagamento.
- **Histórico de Transações (`TransactionHistory`):** Rastreabilidade de cada evento de mudança de status (`WAITING`, `APPROVED`, etc) nas transações.
- **Saques e Liquidações (`Withdrawal`):** Como os produtores realizam a antecipação ou saque dos próprios saldos, essa rotina possibilita solicitar fundos que os agentes administradores (Back-office users) podem aprovar, recusar ou completar manualmente. O cálculo é gerado a partir do total processado versus o já retirado.

### 3. Segurança e Auditoria (Configurações)
- **Usuários Administrativos (`User`):** Agentes do sistema que logaram no backoffice. 
- **Perfis de Acesso (`Profile`):** Sistema de permissões RBAC dinâmico via propriedades string num JSON. Exemplo: `["dashboard:view", "clients:manage"]`. Limita a execução de operações destrutivas e vizualizações em áreas críticas ou relatórios financeiros pela equipe interna.
- **Auditoria Log (`AuditLog`):** Uma trilha essencial de segurança (*Audit Trail*) salva no banco para registrar "quem fez o quê, quando e de qual IP", guardando o estado original/após nas mudanças sensíveis de usuários e perfis.

---

## Tecnologias e Deploy
- **Ambiente de Build / CI-CD:** O repositório está integrado ao Easypanel (Docker container). O deploy utiliza Docker Multi-stage garantindo arquivos otimizados e seguros sem conflitos de pacotes `devDependencies` do NestJS e Next.js.
- **Segurança no Build:** Por motivos de agilidade, os *lintings* e validações Typescript estão suprimidos via propriedades do framework (ex: `next.config.ts`) de modo que a infraestrutura foca na execução fluída.

*(Os arquivos README isolados dos frameworks originais foram removidos deste projeto para centralizar o conhecimento nesta documentação)*
