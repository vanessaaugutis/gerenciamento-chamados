# gerenciamento-chamados
Sistema de Gestão de Chamados de TI

## Configuração do PostgreSQL

Para rodar o backend com TypeORM, você precisará de um banco PostgreSQL disponível.

### 1. Criar o banco
Crie um banco chamado:

```sql
CREATE DATABASE gerenciamento_chamados;
```

### 2. Variáveis de ambiente
No backend, defina estas variáveis antes de iniciar a aplicação:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=gerenciamento_chamados
```

### 3. Rodar o backend
A partir da pasta backend:

```bash
npm install
npm run start:dev
```

> Se o PostgreSQL não estiver rodando ou as credenciais estiverem incorretas, o backend não conseguirá conectar.
