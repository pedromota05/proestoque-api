# ProEstoque API 🚀

A API do ProEstoque é o backend robusto responsável por gerenciar a autenticação e as operações de estoque do aplicativo. Projetada com foco em **segurança, performance e escalabilidade**, ela serve como a base sólida para nossa aplicação web e mobile.

## 🏗️ Arquitetura e Padrões

O projeto foi construído utilizando os princípios de **Clean Architecture**, garantindo um código manutenível e bem estruturado:
- **Separação de Responsabilidades:** Fluxo claro de execução dividindo as camadas (Rotas → Controllers → Casos de Uso/Serviços).
- **Tratamento de Erros Centralizado:** Utilização de uma classe customizada `AppError` para capturar e padronizar todas as respostas de erro da API.
- **CORS Configurado:** Permite acesso seguro e integrado para as requisições do frontend web e do aplicativo mobile.

## 🛠️ Tecnologias Utilizadas

- **Node.js** com **Express** (Framework web)
- **TypeScript** (Tipagem forte e segurança no desenvolvimento)
- **Prisma** (ORM moderno e type-safe)
- **PostgreSQL** (Banco de dados relacional robusto, utilizado em produção)
- **JWT** (JSON Web Tokens para Autenticação com Refresh Token Rotation)
- **Zod** (Validação de schemas de requisição)
- **Bcrypt** (Criptografia de senhas)
- **Nodemailer** (Envio de e-mails, utilizando Mailtrap para ambiente de desenvolvimento/testes)

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado.
- PostgreSQL rodando localmente ou em nuvem (ou Docker).

## 💻 Como Rodar Localmente

1. **Clone o repositório** e entre na pasta da API:
   ```bash
   cd proestoque-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configuração de Variáveis de Ambiente:**
   - Crie um arquivo `.env` na raiz do projeto baseado nas necessidades. Exemplo:
     ```env
     # Configurações do Servidor
     PORT=3333
     NODE_ENV="development"
     FRONTEND_URL="http://localhost:3000"

     # Banco de Dados
     DATABASE_URL="postgresql://usuario:senha@localhost:5432/proestoque?schema=public"

     # Autenticação
     JWT_SECRET="gere_uma_chave_segura_aqui"

     # Configurações de E-mail (Exemplo com Mailtrap)
     SMTP_HOST="sandbox.smtp.mailtrap.io"
     SMTP_PORT=2525
     SMTP_USER="seu_usuario_mailtrap"
     SMTP_PASS="sua_senha_mailtrap"
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

## 🛣️ Principais Endpoints

### Autenticação (`/api/auth`)
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/registro` | Cria uma nova conta e retorna Access e Refresh Tokens. |
| `POST` | `/login` | Autentica o usuário e retorna Access e Refresh Tokens. |
| `POST` | `/refresh` | Troca um Refresh Token por novos tokens (Access e Refresh). |
| `GET`  | `/me` | Retorna os dados do perfil do usuário autenticado. |
| `POST` | `/solicitar-reset` | Recebe o e-mail e gera o token temporário via envio de e-mail. |
| `POST` | `/redefinir-senha` | Recebe o token da URL e a nova senha para atualizar no banco. |

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

## 🚀 Produção / Deploy

O projeto está configurado e implantado em um ambiente de produção moderno e escalável:

- **Backend & Banco de Dados:** A API Node.js e o banco de dados PostgreSQL estão hospedados no **Render** (ou Railway), garantindo alta disponibilidade e performance para as requisições e armazenamento de dados.
- **Frontend:** A interface do usuário (React Native Web) está publicada na **Vercel**, fornecendo um carregamento rápido, estável e otimizado.
