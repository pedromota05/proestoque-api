# ProEstoque API 🚀

A API do ProEstoque é o backend responsável por gerenciar a autenticação e as operações de estoque do aplicativo. Foi construída com foco em segurança, performance e tipagem forte.

## Tecnologias Utilizadas 🛠️

- **Node.js** com **Express** (Framework web)
- **TypeScript** (Tipagem forte)
- **Prisma** (ORM)
- **SQLite** (Banco de dados leve e portátil)
- **JWT** (JSON Web Tokens para Autenticação com Refresh Token Rotation)
- **Zod** (Validação de schemas de requisição)
- **Bcrypt** (Criptografia de senhas)

## Pré-requisitos 📋

- [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado.

## Como Rodar Localmente 💻

1. **Clone o repositório** e entre na pasta da API:
   ```bash
   cd proestoque-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configuração de Variáveis de Ambiente:**
   - Crie um arquivo `.env` na raiz do projeto baseado nas necessidades, exemplo:
     ```env
     PORT=3333
     DATABASE_URL="file:./dev.db"
     NODE_ENV="development"
     JWT_SECRET="gere_uma_chave_segura_aqui"
     ```
   - Para gerar uma chave segura para o `JWT_SECRET`, você pode usar o comando Node:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

4. **Banco de Dados (Migrations):**
   - Execute o Prisma para criar o banco de dados e aplicar o schema:
     ```bash
     npx prisma migrate dev
     ```

5. **Seeds (Opcional):**
   - Popule o banco com dados iniciais (se houver script configurado):
     ```bash
     npm run db:seed
     ```

6. **Inicie o Servidor:**
   ```bash
   npm run dev
   ```
   A API estará rodando em `http://localhost:3333`.

## Principais Endpoints 🛣️

### Autenticação (`/api/auth`)
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/registro` | Cria uma nova conta e retorna Access e Refresh Tokens. |
| `POST` | `/login` | Autentica o usuário e retorna Access e Refresh Tokens. |
| `POST` | `/refresh` | Troca um Refresh Token por novos tokens (Access e Refresh). |
| `GET`  | `/me` | Retorna os dados do perfil do usuário autenticado. |

### Produtos (`/api/produtos`)
*(Requer Autenticação)*
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET`  | `/` | Lista os produtos (com suporte a paginação/filtros). |
| `POST` | `/` | Adiciona um novo produto ao estoque. |
| `PUT`  | `/:id`| Atualiza os dados de um produto existente. |
| `DELETE`| `/:id`| Remove um produto. |

### Categorias (`/api/categorias`)
*(Requer Autenticação)*
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET`  | `/` | Lista todas as categorias. |
| `POST` | `/` | Cria uma nova categoria. |
