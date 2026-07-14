# gerenciamento-chamados
Sistema de Gestão de Chamados de TI

## Tecnologias utilizadas

- Backend
  - NestJS 11
  - TypeScript
  - TypeORM
  - PostgreSQL
  - Passport JWT
  - bcryptjs
- Frontend
  - React 19
  - TypeScript
  - Vite
  - React Router DOM
  - Recharts
- Ferramentas de desenvolvimento
  - ESLint
  - Prettier
  - Jest

## Requisitos para execução

- Node.js 18+ (recomendado 20+)
- npm 10+
- PostgreSQL 14+
- Git

## Passo a passo para instalação

1. Clone o repositório:

```bash
git clone https://github.com/vanessaaugutis/gerenciamento-chamados.git
cd gerenciamento-chamados
```

2. Instale dependências do backend:

```bash
cd backend
npm install
```

3. Instale dependências do frontend:

```bash
cd ../frontend
npm install
```

## Configuração do banco de dados

### 1. Criar o banco
Use o PostgreSQL para criar o banco de dados:

```sql
CREATE DATABASE gerenciamento_chamados;
```

### 2. Definir variáveis de ambiente
No backend, configure as variáveis de ambiente abaixo. Você pode usar um arquivo `.env` copiando o .env.example ou exportar diretamente no terminal.

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=gerenciamento_chamados
PORT=3000
JWT_SECRET=gere-uma-chave-aleatoria-longa
JWT_REFRESH_SECRET=gere-outra-chave-aleatoria-longa
FRONTEND_URL=http://localhost:5173
```

### 3. Configuração padrão do backend
O backend usa os mesmos valores como padrão quando as variáveis de ambiente não estão definidas.

- host: `localhost`
- port: `5432`
- username: `postgres`
- password: `postgres`
- database: `gerenciamento_chamados`

### 4. Rodar migrations / seed
Para aplicar migrations e carregar dados iniciais execute:

```bash
cd backend
npm run migration:run
npm run seed
```

> Se não quiser usar migrations, você pode criar o schema diretamente via `npm run seed`, mas o ideal é rodar as migrations primeiro.

## Como executar o projeto

### Backend

```bash
cd backend
npm run start:dev
```

O backend ficará disponível em `http://localhost:3000` por padrão.

### Frontend

```bash
cd frontend
npm run dev
```

O frontend será servido via Vite em uma porta local, normalmente `http://localhost:5173`.

## Credenciais de acesso de teste

O projeto inclui um seed de usuários de teste. As credenciais são:

- Admin
  - email: `admin@empresa.com`
  - senha: `123456`
- Maria Silva
  - email: `maria@empresa.com`
  - senha: `123456`
- João Pereira
  - email: `joao@empresa.com`
  - senha: `123456`

## Estrutura do projeto

```
/README.md
/backend
  /src
    /app.module.ts
    /data-source.ts
    /ormconfig.ts
    /seed.ts
    /entities
      CategorieEntity.ts
      CommentEntity.ts
      HistoryEntity.ts
      TicketEntity.ts
      UserEntity.ts
    /migrations
    /tickets
      tickets.controller.ts
      tickets.module.ts
      tickets.service.ts
    /users
      users.controller.ts
      users.module.ts
      users.service.ts
      /dto
        create-user.dto.ts
        login-user.dto.ts
/frontend
  /src
    /pages
      Categories.tsx
      Dashboard.tsx
      Login.tsx
      Register.tsx
      Tickets.tsx
    /services
      auth.ts
      categories.ts
      dashboard.ts
      tickets.ts
    /components
    /hooks
    /assets
    /public
```

## Decisões técnicas adotadas

- O backend foi construído com NestJS para oferecer uma arquitetura modular e compatível com TypeORM.
- TypeORM foi escolhido para mapear entidades e facilitar a manipulação do banco PostgreSQL com o uso de migrations.
- A aplicação usa JWT para autenticação e `bcryptjs` para hashing de senhas.
- O frontend foi desenvolvido com React + Vite para uma experiência rápida de desenvolvimento e build.
- A interface de tickets contém filtros, paginação, edição em modal e visualização de histórico.
- O seed inicial fornece categorias, usuários e tickets de exemplo para testes rápidos.
- A configuração de banco é orientada por variáveis de ambiente, com valores padrão seguros para desenvolvimento local.

## Observações

- Verifique se o PostgreSQL está em execução antes de iniciar o backend.
- Se a porta padrão do frontend já estiver ocupada, o Vite pedirá outra porta automaticamente.
- Para gerar novas migrations use `npm run migration:generate` no backend.
