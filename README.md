# 🎶 PrismaHall

Aplicação web **full-stack** para uma **casa de show**, desenvolvida com Next.js, React e TypeScript, permitindo a consulta da agenda de eventos, a compra de ingressos e vouchers do bar com pagamento online, a retirada dos pedidos na casa e a administração completa da operação.

O projeto foi desenvolvido com foco em boas práticas de arquitetura, organização escalável por features, modelagem de dados relacional com Prisma e PostgreSQL e uma suíte ampla de testes automatizados.

🔗 Deploy: https://prisma-hall-daniel-lorenzos-projects.vercel.app/
🔗 Repositório: https://github.com/hubdanielcode/Prisma-Hall

---

## 🚀 Demonstração

O sistema permite:

- Cadastro com validação da conta por e-mail, login e recuperação de senha
- Consulta da agenda de eventos com filtro por gênero musical
- Visualização dos detalhes de cada evento e de suas atrações
- Favoritar eventos
- Carrinho com ingressos e itens do bar
- Pagamento online com Stripe (Pix e cartão)
- Histórico de pedidos, detalhes do pedido e cancelamento com reembolso
- Avaliações e galeria de fotos dos eventos
- Notificações dentro do site, com preferências configuráveis
- Inscrição na newsletter
- Badges de conquista por usuário (verificado, frequente e antigo)
- Edição e exclusão do perfil
- Painel administrativo com gestão de eventos, atrações, galeria, produtos do bar, usuários e retirada de pedidos
- Analytics de receita de ingressos, receita de vouchers e novos visitantes

---

## 🏗️ Arquitetura e Decisões Técnicas

O projeto foi estruturado seguindo o padrão de organização por **features**, promovendo escalabilidade e separação de responsabilidades:

- `actions`
- `app`
- `features/admin`
- `features/authentication`
- `features/bar`
- `features/cart`
- `features/events`
- `features/newsletter`
- `features/users`
- `lib`
- `prisma`
- `shared`

### Principais decisões técnicas:

- Server Actions para todas as mutações e consultas, com validação Zod antes de acessar o banco
- Código de servidor isolado em `lib/server` (Prisma, Stripe, e-mail, pagamentos, badges, notificações e rate limit)
- Schemas Zod centralizados em `lib/validations`, organizados pelo mesmo domínio das actions
- Rotas do App Router agrupadas por contexto: `(Public)`, `(Authentication)`, `(Protected)` e `(Admin)`
- `proxy.ts` como primeira barreira das rotas protegidas e validação real da sessão nos layouts
- Webhook do Stripe para confirmar, expirar e cancelar pagamentos de forma idempotente
- Cron job diário na Vercel para recalcular os badges de tempo de conta
- Context API para estado de interface (carrinho, bar, agenda, evento, perfil, tema e mobile)
- TanStack Query para estado de servidor
- Hooks customizados para abstração de lógica
- Componentização reutilizável, documentada de forma isolada no Storybook
- Regras de negócio isoladas em funções puras e testáveis (política de cancelamento, janela de edição de avaliações e bloqueio de retirada)
- Estrutura preparada para crescimento e manutenção futura

---

## 🔐 Autenticação

Implementada do zero com Server Actions, sem serviço de autenticação de terceiros, utilizando:

- Registro e login com e-mail e senha
- Senhas protegidas com hash bcrypt
- Validação da conta por e-mail, com reenvio do link
- Link de validação só cria sessão no mesmo navegador do cadastro (chave em cookie `httpOnly` e hash no banco, comparado em tempo constante)
- Sessões persistidas no banco de dados
- Cookie `httpOnly`, `secure` e `sameSite`
- Opção "lembrar de mim" (sessão de 7 dias ou de 2 horas)
- Perfis de acesso `user` e `admin`
- Recuperação de senha com token e e-mail transacional (Brevo e React Email)
- Rate limit persistido no banco para login, cadastro, validação, recuperação de senha e exclusão de perfil, com contador atômico e identificador em hash
- Validação dos dados com Zod

---

## 💳 Pagamentos e Pedidos

O fluxo de compra combina Server Actions, Stripe e regras de negócio isoladas:

- Checkout do carrinho com ingressos e vouchers do bar em pedidos separados
- Sessão de pagamento no Stripe (Pix e cartão), com confirmação, expiração e falha tratadas pelo webhook
- Cancelamento de pedidos não pagos de forma segura contra concorrência entre o usuário e o webhook
- Cancelamento de ingressos permitido até 24 horas antes do evento, com reembolso no Stripe
- Retirada dos pedidos no balcão, liberada apenas para pedidos não cancelados, com pagamento confirmado e ainda não retirados
- E-mails transacionais de confirmação de pedido, confirmação de pagamento e reembolso
- Taxa de serviço aplicada no carrinho
- Exclusão de conta que anonimiza os dados e é bloqueada enquanto houver ingressos de eventos futuros ou vouchers pagos não retirados, e também para o último administrador

---

## ⚙️ Funcionalidades

✔ Agenda de eventos com filtro por gênero  
✔ Página de detalhes do evento e atrações  
✔ Eventos favoritos  
✔ Carrinho com ingressos e itens do bar  
✔ Checkout com Stripe (Pix e cartão)  
✔ Pedidos, detalhes do pedido e cancelamento com reembolso  
✔ Avaliações de eventos (edição liberada por 3 minutos após a criação)  
✔ Galeria de fotos com curtidas  
✔ Notificações e preferências de notificação  
✔ Newsletter  
✔ Badges de conquista (verificado, frequente e antigo)  
✔ Perfil do usuário  
✔ Validação de conta e recuperação de senha por e-mail  
✔ CRUD de eventos, atrações e fotos da galeria  
✔ Cancelamento de eventos com notificação dos usuários  
✔ CRUD de produtos do bar  
✔ Gestão de usuários e dos níveis de badge  
✔ Gestão de retirada de pedidos  
✔ Filtros e paginação nas tabelas administrativas  
✔ Upload de imagens com Vercel Blob  
✔ Analytics administrativo (receita de ingressos, receita de vouchers e novos visitantes)  
✔ Páginas institucionais (sobre, central de ajuda, perguntas frequentes, trabalhe conosco, termos de uso, política de privacidade e política de reembolso)  
✔ Página 404 personalizada  
✔ Testes automatizados com Vitest  
✔ Componentes documentados no Storybook

---

## 🗄️ Banco de Dados

Schema relacional modelado com Prisma e PostgreSQL, com 21 modelos e 20 migrations versionadas:

- **Usuários:** `User`, `Profile`, `Session`
- **Eventos:** `Event`, `Attraction`, `Review`, `Gallery`, `GalleryLikes`, `FavoriteEvent`
- **Ingressos:** `Ticket`, `TicketOrder`, `TicketPayment`
- **Vouchers:** `Voucher`, `VoucherOrder`, `VoucherPayment`
- **Bar e carrinho:** `Product`, `Cart`
- **Comunicação:** `Notification`, `NotificationPreference`, `Newsletter`
- **Infraestrutura:** `RateLimit`

O histórico de alterações do banco é versionado em `src/prisma/migrations` e o client é gerado em `src/prisma/generated`.

---

## 🧪 Testes

O projeto possui mais de 120 arquivos de teste, com a estrutura de pastas espelhando a de `src`:

- **Actions** — admin (eventos, atrações, galeria, bar, usuários, retirada e analytics), autenticação, bar, carrinho, eventos, avaliações, galeria, newsletter, pagamentos, notificações, perfil, ingressos e vouchers
- **Rotas de API** — webhook do Stripe e cron de badges
- **Lib de servidor** — badges, rate limit, sessão, validação por navegador, pagamentos, reembolso, notificações, anonimização de usuários, status de eventos, regra de retirada e serviços (Prisma, bcrypt, Stripe e e-mail)
- **Validações** — schemas Zod de todos os domínios
- **Funções utilitárias** — políticas de cancelamento e de edição de avaliações, datas, formatadores, máscaras e tema
- **Proxy** — proteção das rotas privadas

Os testes utilizam `vitest-mock-extended` para isolar o Prisma, mocks dos serviços externos (Stripe, bcrypt, Vercel Blob) e `vi.useFakeTimers()` nas regras que dependem de tempo.

---

## 📚 Storybook

Os componentes são documentados e testados visualmente de forma isolada com o Storybook, que conta com mais de 80 stories, mocks dos hooks e serviços e o addon de acessibilidade.

---

## 🛠️ Tecnologias Utilizadas

- Next.js (App Router e Server Actions)
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL (Supabase)
- Stripe
- TanStack Query
- Zod
- bcrypt
- Brevo + React Email
- Vercel Blob
- Recharts
- Motion
- Vitest + React Testing Library
- Storybook
- Vercel (hospedagem e cron jobs)
- Git & GitHub

---

## ▶️ Executando Localmente

Clone o repositório:

```
git clone https://github.com/hubdanielcode/Prisma-Hall.git
cd Prisma-Hall
```

Instale as dependências:

```
npm install
```

Crie um arquivo `.env.local` com suas credenciais:

```
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
BREVO_API_KEY=your_brevo_key
EMAIL_FROM="Prisma Hall <naoresponda@seudominio.com>"
EMAIL_FROM_ADDRESS=naoresponda@seudominio.com
BLOB_READ_WRITE_TOKEN=your_blob_token
CRON_SECRET=your_cron_secret
```

> `DIRECT_URL` é usada pelo Prisma nas migrations. O remetente (`EMAIL_FROM_ADDRESS`) precisa ser um endereço validado no Brevo. `CRON_SECRET` protege a rota do cron: sem ela, a rota recusa qualquer chamada.

Aplique as migrations e gere o client do Prisma:

```
npx prisma migrate dev
npx prisma generate
```

Execute a aplicação:

```
npm run dev
```

Acesse no navegador:

```
http://localhost:3000
```

Receba os webhooks do Stripe localmente:

```
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Execute os testes:

```
npm run test
```

Abra a interface do Vitest:

```
npm run test:ui
```

Execute o Storybook:

```
npm run storybook
```

---

## 🧠 Conceitos Aplicados

- Componentização
- Organização escalável por features
- Server Actions e renderização no servidor com o App Router
- Autenticação e sessões implementadas do zero
- Modelagem relacional e migrations com Prisma
- Validação de dados com schemas Zod
- Integração com gateway de pagamento e webhooks idempotentes
- Controle de concorrência com transações e operações atômicas
- Rate limit persistido em banco
- Controle de acesso por perfil (usuário e administrador)
- Regras de negócio isoladas em funções puras
- Cron jobs e rotas protegidas por segredo
- E-mails transacionais com templates em React
- Testes automatizados de actions, rotas de API, serviços e validações
- Documentação de componentes com Storybook
- Boas práticas de estruturação de projeto full-stack

---

## 📂 Estrutura do Projeto

```
PrismaHall/
├── .storybook/
│   ├── mocks/
│   │   ├── hooks/
│   │   └── services/
│   │       ├── bcrypt.ts
│   │       ├── prisma.ts
│   │       └── stripe.ts
│   │
│   ├── main.ts
│   └── preview.tsx
│
├── public/
│
├── src/
│   ├── actions/
│   │   ├── admin/
│   │   │   ├── analytics-management/
│   │   │   ├── bar-management/
│   │   │   ├── events-management/
│   │   │   │   ├── attraction-management/
│   │   │   │   ├── event-management/
│   │   │   │   └── gallery-management/
│   │   │   ├── pickup-management/
│   │   │   ├── users-management/
│   │   │   └── checkIsAdmin.ts
│   │   │
│   │   ├── authentication/
│   │   ├── bar/
│   │   ├── cart/
│   │   ├── events/
│   │   │   ├── agenda/
│   │   │   ├── event/
│   │   │   ├── gallery/
│   │   │   └── reviews/
│   │   ├── newsletter/
│   │   ├── payments/
│   │   ├── users/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── tickets/
│   │   │   ├── user/
│   │   │   └── vouchers/
│   │   │
│   │   └── index.ts
│   │
│   ├── app/
│   │   ├── (Admin)/
│   │   │   └── admin/
│   │   │
│   │   ├── (Authentication)/
│   │   │   ├── cadastro/
│   │   │   ├── login/
│   │   │   ├── recuperar-senha/
│   │   │   └── validar-conta/
│   │   │
│   │   ├── (Protected)/
│   │   │   ├── carrinho/
│   │   │   ├── pedidos/
│   │   │   │   └── [orderId]/
│   │   │   │       ├── cancelar-pedidos/
│   │   │   │       └── detalhes-do-pedido/
│   │   │   ├── perfil/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (Public)/
│   │   │   ├── agenda/
│   │   │   ├── central-de-ajuda/
│   │   │   ├── perguntas-frequentes/
│   │   │   ├── politica-de-privacidade/
│   │   │   ├── politica-de-reembolso/
│   │   │   ├── sobre/
│   │   │   ├── termos-de-uso/
│   │   │   ├── trabalhe-conosco/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── cron/
│   │   │   │   └── old-user-badges/
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── not-found.tsx
│   │
│   ├── features/
│   │   ├── admin/
│   │   │   ├── analytics-management/
│   │   │   ├── bar-management/
│   │   │   ├── events-management/
│   │   │   ├── pickup-management/
│   │   │   ├── users-management/
│   │   │   └── index.ts
│   │   │
│   │   ├── authentication/
│   │   ├── bar/
│   │   ├── cart/
│   │   ├── events/
│   │   │   ├── agenda/
│   │   │   ├── attractions/
│   │   │   ├── event/
│   │   │   ├── gallery/
│   │   │   └── reviews/
│   │   ├── newsletter/
│   │   └── users/
│   │       ├── notifications/
│   │       ├── profiles/
│   │       ├── tickets/
│   │       ├── user/
│   │       └── vouchers/
│   │
│   ├── lib/
│   │   ├── server/
│   │   │   ├── authentication/
│   │   │   │   ├── createSession.ts
│   │   │   │   └── validationBrowser.ts
│   │   │   ├── badges/
│   │   │   ├── events/
│   │   │   ├── notifications/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── rate-limit/
│   │   │   ├── services/
│   │   │   │   ├── bcrypt.ts
│   │   │   │   ├── prisma.ts
│   │   │   │   ├── resend.ts
│   │   │   │   └── stripe.ts
│   │   │   ├── users/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   │
│   │   └── validations/
│   │       ├── admin/
│   │       ├── authentication/
│   │       ├── cart/
│   │       ├── events/
│   │       ├── newsletter/
│   │       ├── shared/
│   │       ├── users/
│   │       └── index.ts
│   │
│   ├── prisma/
│   │   ├── generated/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── emails/
│   │   │   ├── OrderConfirmationEmail.tsx
│   │   │   ├── PasswordResetEmail.tsx
│   │   │   ├── PaymentConfirmationEmail.tsx
│   │   │   ├── RefundConfirmationEmail.tsx
│   │   │   └── ValidateAccountEmail.tsx
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── content-pages/
│   │   │   └── footer-links/
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx
│   │   └── utils/
│   │       ├── constants/
│   │       └── functions/
│   │           ├── atLeastOneFieldUpdated.ts
│   │           ├── cancellationPolicy.ts
│   │           ├── dates.ts
│   │           ├── formatters.ts
│   │           ├── masks.ts
│   │           ├── reviewEditPolicy.ts
│   │           └── theme.ts
│   │
│   └── proxy.ts
│
├── tests/
│   ├── src/
│   │   ├── actions/
│   │   ├── app/
│   │   │   └── api/
│   │   ├── lib/
│   │   │   ├── server/
│   │   │   └── validations/
│   │   ├── shared/
│   │   │   └── utils/
│   │   │       └── functions/
│   │   └── proxy.test.ts
│   │
│   └── setup.ts
│
├── .gitignore
├── eslint.config.js
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.ts
├── prisma.config.ts
├── tsconfig.json
├── vercel.json
├── vite.config.ts
└── README.md
```

---

## 🌍 Deploy

O projeto é preparado para publicação na Vercel, garantindo:

- Deploy automático via GitHub
- Build otimizado para produção
- Cron job diário (`0 3 * * *`) para recalcular os badges de tempo de conta
- Ambiente seguro com variáveis de ambiente configuradas no painel da Vercel

---

## 📱 Responsividade

A aplicação possui adaptação para diferentes tamanhos de tela, com layouts e componentes ajustados para desktop e mobile, incluindo as tabelas e os formulários do painel administrativo.

---

## 📌 Observações

- As rotas `/perfil`, `/carrinho`, `/pedidos` e `/admin` exigem login, e `/admin` exige o perfil de administrador
- Os badges de verificado e frequente são recalculados a partir da atividade do usuário, e o de tempo de conta é atualizado pelo cron diário
- Cancelamentos de ingressos só são aceitos até 24 horas antes do evento, e a edição de uma avaliação só até 3 minutos após sua criação (a exclusão continua liberada)
- Se o valor do prazo de cancelamento mudar, a Política de Reembolso e o FAQ também precisam ser atualizados
- As variáveis de ambiente são obrigatórias para o funcionamento local, e as chaves nunca devem ser commitadas

---

## 📄 Licença

Este projeto é livre para fins de estudo, aprendizado e uso pessoal.
