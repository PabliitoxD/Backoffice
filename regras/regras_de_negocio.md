# Documentação de Regras de Negócio - Backoffice

Esta documentação consolida as regras de negócio inferidas a partir da estrutura de banco de dados (Prisma) e da interface da plataforma (Frontend React).

---

## 1. Entidades Principais (Modelo de Dados)

O sistema centraliza-se na relação entre **Produtores (Sellers)**, **Produtos**, **Clientes (Compradores)** e as **Transações** financeiras geradas.

- **Producer (Produtor)**: Usuário ou empresa que utiliza a plataforma para vender seus produtos. Possui dados empresariais/pessoais, um *Plano de Taxas* associado e uma lista de Produtos criados.
- **Product (Produto)**: Item comercializado pelo Produtor. Possui um código único e um preço base de venda.
- **Customer (Cliente/Comprador)**: Consumidor final que adquire o Produto. É identificado unicamente por documento (CPF/CNPJ) e possui dados de contato e tipo de pessoa (Física/Jurídica).
- **Transaction (Transação)**: O registro de uma venda. Vincula o Comprador, o Produtor e o Produto. Registra o método de pagamento, condição de parcelamento, valor total da venda, além de todo o histórico de status daquele pagamento.

---

## 2. Regras Operacionais e de Transação (Vendas)

### 2.1. Métodos de Pagamento Suportados
O sistema processa vendas através dos seguintes métodos operacionais:
- **PIX** (Liquidação imediata)
- **Cartão de Crédito** (Pagamento à vista ou parcelado)
- **Boleto Bancário** (Pagamento assíncrono com tempo de compensação)

### 2.2. Fluxo e Status de Pagamento (Transaction Status)
O ciclo de vida de uma transação passa por status rigorosos definidos no sistema, que ditam as ações permitidas e o estado do saldo:
- `WAITING` (Aguardando Pagamento): O processo de compra foi iniciado (ex: QRCode do PIX gerado ou Boleto emitido), mas o pagamento ainda não foi liquidado pela instituição de pagamento.
- `APPROVED` (Aprovada): O pagamento foi confirmado pela instituição e os fundos estão garantidos.
- `COMPLETED` (Finalizada): O período de garantia expirou. O saldo desta transação fica inteiramente liberado ao Produtor para saque.
- `NOT_COMPLETED` (Dados Inválidos): A tentativa falhou devido a um erro de digitação do cliente (ex: cartão incorreto).
- `REFUSED` (Recusada): A transação foi ativamente bloqueada por suspeita de fraude (Gateway/Antifraude) ou recusada pelo banco emissor.
- `REVERSED` / `CLAIMED` (Estornada / Reembolsada): O dinheiro foi devolvido pacificamente ao cliente comprador após solicitação de cancelamento.
- `CHARGEBACK`: O cliente comprador não reconheceu a compra na fatura do cartão, gerando uma contestação coercitiva.

### 2.3. Motor de Taxas e Comissões (Split de Pagamento)
A plataforma lucra aplicando taxas sobre as transações processadas, realizando um *split* transparente.
- **Receita Líquida do Produtor**: Valor bruto pago pelo comprador subtraído das taxas da plataforma.
- **Regras de Custo Base**:
  - **PIX**: Geralmente não possui taxa percentual, incidindo apenas uma taxa fixa (Ex: `R$ 1,00` por transação).
  - **Cartão / Boleto**: Incide uma taxa percentual sobre o valor global + taxa fixa de liquidação (Ex: `4.99% + R$ 1,00`).

---

## 3. Regras de Gestão de Clientes (Backoffice)

Os usuários do Backoffice podem gerenciar os **Produtores (Clientes da plataforma)**. 

### 3.1. Status da Conta do Produtor
O ciclo de vida e qualificação do cliente dentro do Backoffice recai sob 3 estados:
- **Pendente**: Cadastro realizado, mas sob análise (compliance/KYC não finalizado).
- **Ativo**: Operação liberada, recebendo vendas normalmente.
- **Inativo**: Cadastro desabilitado temporária ou permanentemente.

### 3.2. Estrutura de Planos e Preificação
A cada cliente é atribuído um modelo comercial para determinar como serão calculadas as taxas do *Motor de Comissões* (Item 2.3).
1. **Planos Universais (Sistema)**: Há pacotes globais pré-definidos (Ex: Básico, Standard, Premium) contendo taxas amarradas pelo sistema que escalam de acordo com o volume do cliente (Ex: Básico taxa Pix de 0.99% contra Premium taxa Pix de 0.79%).
2. **Modelo Personalizado (Sob Demanda)**: Permite que administradores definam de forma arbitrária taxas customizadas (Ex: "Taxa de Liquidação Exclusiva de 1.5%") para clientes ("Key Accounts") oriundos de negociações próprias da equipe comercial.

### 3.3. Representação Empresarial
O cadastro do cliente exige de forma contígua os **dados empresariais operacionais** (CNPJ, Razão Social, Nome Fantasia, Localização) e os **dados de uma Pessoa Física legalmente responsável** (CPF, Contato, Nascimento), viabilizando responsabilizações legais e fiscais atreladas à operação de recebimento de pagamentos de terceiros.

---

## 4. Autenticação e Gestão de Usuários (Backoffice)

O acesso ao painel de administração (Backoffice) é restrito a operadores e administradores autenticados.

### 4.1. Cadastro de Usuários Administrativos
Diferente dos Produtores (Sellers), os Usuários Administrativos (`User`) são membros da equipe interna da plataforma. O cadastro de um novo usuário exige nome, e-mail corporativo único e uma senha forte. As credenciais são criptografadas (Hash via bcrypt) antes de serem armazenadas no banco de dados para garantir a segurança.

### 4.2. Fluxo de Login e Segurança
- **Autenticação (Login):** O usuário preenche e-mail e senha na tela de `/login`. O backend valida a criptografia e emite um Token de Sessão (ex: JWT) com tempo de expiração.
- **Autorização (Roles):** Cada usuário possui um nível de permissão (Role). Por padrão, o sistema opera com `ADMIN` (acesso total para editar planos, ver transações e credenciar clientes).
- **Proteção de Rotas:** O Frontend e o Backend validam ativamente a presença e validade do token. Requisições não autenticadas são bloqueadas e redirecionadas para a tela de login.
