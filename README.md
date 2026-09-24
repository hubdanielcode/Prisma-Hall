# 🎶 PrismaHall

Aplicação web **full-stack** para uma **casa de show**, desenvolvida com Next.js, React e TypeScript, permitindo a consulta da agenda de eventos, a montagem de pedidos com ingressos e itens do bar e a administração completa da operação da casa.

O projeto foi desenvolvido com foco em boas práticas de arquitetura, organização escalável por features e modelagem de dados relacional com Prisma e PostgreSQL.

🔗 Repositório: https://github.com/hubdanielcode/Prisma-Hall

---

## 🚀 Demonstração

O sistema permite:

- Cadastro, login e recuperação de senha por e-mail
- Consulta da agenda de eventos com filtro por gênero musical
- Visualização dos detalhes de cada evento e de suas atrações
- Adição de ingressos e itens do bar ao carrinho
- Avaliações e galeria de fotos dos eventos
- Edição do perfil do usuário
- Painel administrativo com gestão de eventos, atrações, produtos do bar e usuários
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
- `features/users`
- `lib`
- `prisma`
- `shared`

### Principais decisões técnicas:

- Server Actions para todas as mutações e consultas, com validação Zod antes de acessar o banco
- Separação clara entre lógica, UI e serviços
- Rotas do App Router agrupadas por contexto: `(Public)`, `(Authentication)`, `(Protected)` e `(Admin)`
- Camada de services para comunicação com o Supabase
- Context API para gerenciamento de estado (carrinho, bar e agenda)
- TanStack Query para estado de servidor
- Hooks customizados para abstração de lógica
- Componentização reutilizável, documentada de forma isolada no Storybook
- Estrutura preparada para crescimento e manutenção futura

---

## 🔐 Autenticação

Implementada do zero com Server Actions, sem serviço de autenticação de terceiros, utilizando:

- Registro e login com e-mail e senha
- Senhas protegidas com hash bcrypt
- Sessões persistidas no banco de dados
- Cookie `httpOnly`, `secure` e `sameSite`
- Opção "lembrar de mim" (sessão de 7 dias ou de 2 horas)
- Perfis de acesso `user` e `admin`
- Recuperação de senha com token e e-mail transacional (Resend e React Email)
- Validação dos dados com Zod

---

## ⚙️ Funcionalidades

✔ Agenda de eventos com filtro por gênero  
✔ Página de detalhes do evento e atrações  
✔ Carrinho com ingressos e itens do bar  
✔ Avaliações de eventos  
✔ Galeria de fotos com curtidas  
✔ Perfil do usuário  
✔ Recuperação de senha por e-mail  
✔ CRUD de eventos e atrações  
✔ CRUD de produtos do bar  
✔ Gestão de usuários  
✔ Filtros e paginação nas tabelas administrativas  
✔ Upload de imagens com Vercel Blob  
✔ Analytics administrativo (receita de ingressos, receita de vouchers e novos visitantes)  
✔ Páginas institucionais (sobre, central de ajuda, perguntas frequentes, trabalhe conosco, termos de uso, política de privacidade e política de reembolso)

---

## 🗄️ Banco de Dados

Schema relacional modelado com Prisma e PostgreSQL, com 16 modelos:

- **Usuários:** `User`, `Profile`, `Session`
- **Eventos:** `Event`, `Attraction`, `Review`, `Gallery`, `GalleryLikes`
- **Ingressos:** `Ticket`, `TicketOrder`, `TicketPayment`
- **Vouchers:** `Voucher`, `VoucherOrder`, `VoucherPayment`
- **Bar e carrinho:** `Product`, `Cart`

O histórico de alterações do banco é versionado em migrations, em `src/prisma/migrations`.

---

## 📚 Storybook

Os componentes são documentados e testados visualmente de forma isolada com o Storybook, que conta com mais de 45 stories e com o addon de acessibilidade.

---

## 🛠️ Tecnologias Utilizadas

- Next.js (App Router e Server Actions)
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Supabase
- TanStack Query
- Zod
- bcrypt
- Resend + React Email
- Vercel Blob
- Storybook
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
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
RESEND_API_KEY=your_resend_key
BLOB_READ_WRITE_TOKEN=your_blob_token
```

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
- Gerenciamento de estado com Hooks, Context API e TanStack Query
- Controle de acesso por perfil (usuário e administrador)
- E-mails transacionais com templates em React
- Documentação de componentes com Storybook
- Boas práticas de estruturação de projeto full-stack

---

## 📂 Estrutura do Projeto

```
PrismaHall/
├── .git/
├── node_modules/
├── .storybook/
│   ├── mocks/
│   │   ├── bcrypt.ts
│   │   ├── prisma.ts
│   │   ├── useAuthentication.ts
│   │   ├── useProducts.ts
│   │   └── useProfile.ts
│   │
│   ├── main.ts
│   └── preview.tsx
│
├── public/
│   ├── checkbox/
│   │   └── checkmark.svg
│   │
│   ├── images/
│   │   ├── ph-bar.png
│   │   ├── ph-mezanino.png
│   │   ├── ph-palco.png
│   │   └── ph-quinas.png
│   │
│   └── logo/
│       ├── ph-icon.png
│       └── ph-logo.png
│
├── src/
│   ├── actions/
│   │   ├── admin/
│   │   │   ├── analytics-management/
│   │   │   │   ├── getNewVisitors.ts
│   │   │   │   ├── getTicketIncome.ts
│   │   │   │   └── getVoucherIncome.ts
│   │   │   │
│   │   │   ├── bar-management/
│   │   │   │   ├── createProduct.ts
│   │   │   │   ├── deleteProduct.ts
│   │   │   │   └── editProduct.ts
│   │   │   │
│   │   │   ├── events-management/
│   │   │   │   ├── createAttraction.ts
│   │   │   │   ├── createEvent.ts
│   │   │   │   ├── deleteAttraction.ts
│   │   │   │   ├── deleteEvent.ts
│   │   │   │   ├── editAttraction.ts
│   │   │   │   └── editEvent.ts
│   │   │   │
│   │   │   ├── users-management/
│   │   │   │   ├── deleteUser.ts
│   │   │   │   └── editUser.ts
│   │   │   │
│   │   │   └── checkIsAdmin.ts
│   │   │
│   │   ├── authentication/
│   │   │   ├── passwordReset.ts
│   │   │   ├── requestPasswordReset.ts
│   │   │   ├── signIn.ts
│   │   │   └── signUp.ts
│   │   │
│   │   ├── bar/
│   │   │   ├── getAllProducts.ts
│   │   │   └── getSingleProduct.ts
│   │   │
│   │   ├── cart/
│   │   │   ├── addItemToCart.ts
│   │   │   ├── getCartItems.ts
│   │   │   ├── removeItemFromCart.ts
│   │   │   └── updateItemQuantity.ts
│   │   │
│   │   ├── events/
│   │   │   ├── agenda/
│   │   │   │   ├── getAllAttractions.ts
│   │   │   │   └── getSingleAttraction.ts
│   │   │   │
│   │   │   ├── event/
│   │   │   │   ├── getAllEvents.ts
│   │   │   │   └── getSingleEvent.ts
│   │   │   │
│   │   │   ├── gallery/
│   │   │   │   ├── getEventPictures.ts
│   │   │   │   └── likeEventPicture.ts
│   │   │   │
│   │   │   └── reviews/
│   │   │       ├── deleteReview.ts
│   │   │       ├── postReview.ts
│   │   │       └── updateReview.ts
│   │   │
│   │   ├── session/
│   │   │   ├── createSession.ts
│   │   │   ├── revokeSession.ts
│   │   │   └── validateSession.ts
│   │   │
│   │   ├── users/
│   │   │   ├── profile/
│   │   │   │   ├── deleteProfile.ts
│   │   │   │   ├── getProfile.ts
│   │   │   │   └── updateProfile.ts
│   │   │   │
│   │   │   ├── tickets/
│   │   │   │   ├── buyTickets.ts
│   │   │   │   ├── cancelTicketOrder.ts
│   │   │   │   ├── getMyTickets.ts
│   │   │   │   └── getTicketOrder.ts
│   │   │   │
│   │   │   ├── vouchers/
│   │   │   │   ├── buyVouchers.ts
│   │   │   │   ├── cancelVoucherOrder.ts
│   │   │   │   ├── getMyVouchers.ts
│   │   │   │   └── getVoucherOrder.ts
│   │   │   │
│   │   │   └── getShoppingHistory.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── app/
│   │   ├── (Admin)/
│   │   │   └── admin/
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx
│   │   │
│   │   ├── (Authentication)/
│   │   │   ├── cadastro/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── recuperar-senha/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (Protected)/
│   │   │   ├── carrinho/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── pedidos/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── perfil/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (Public)/
│   │   │   ├── agenda/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── central-de-ajuda/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── perguntas-frequentes/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── politica-de-privacidade/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── politica-de-reembolso/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── sobre/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── termos-de-uso/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── trabalhe-conosco/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── not-found.tsx
│   │
│   ├── features/
│   │   ├── admin/
│   │   │   ├── analytics-management/
│   │   │   │   ├── components/
│   │   │   │   │
│   │   │   │   ├── pages/
│   │   │   │   │   └── AnalyticsManagement.tsx
│   │   │   │   │
│   │   │   │   ├── types/
│   │   │   │   │   └── labels.ts
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── bar-management/
│   │   │   │   ├── components/
│   │   │   │   │   ├── CreateProductModal.stories.tsx
│   │   │   │   │   ├── CreateProductModal.tsx
│   │   │   │   │   ├── DeleteProductModal.stories.tsx
│   │   │   │   │   ├── DeleteProductModal.tsx
│   │   │   │   │   ├── EditProductModal.stories.tsx
│   │   │   │   │   ├── EditProductModal.tsx
│   │   │   │   │   ├── ProductsManagementCard.stories.tsx
│   │   │   │   │   ├── ProductsManagementCard.tsx
│   │   │   │   │   ├── ProductsManagementFilter.stories.tsx
│   │   │   │   │   ├── ProductsManagementFilter.tsx
│   │   │   │   │   ├── ProductsManagementTable.stories.tsx
│   │   │   │   │   ├── ProductsManagementTable.tsx
│   │   │   │   │   ├── ProductsTablePagination.stories.tsx
│   │   │   │   │   └── ProductsTablePagination.tsx
│   │   │   │   │
│   │   │   │   ├── pages/
│   │   │   │   │   └── BarManagement.tsx
│   │   │   │   │
│   │   │   │   ├── types/
│   │   │   │   │   └── productCategoryBadges.ts
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── events-management/
│   │   │   │   ├── components/
│   │   │   │   │   ├── CreateAttractionModal.stories.tsx
│   │   │   │   │   ├── CreateAttractionModal.tsx
│   │   │   │   │   ├── CreateEventModal.stories.tsx
│   │   │   │   │   ├── CreateEventModal.tsx
│   │   │   │   │   ├── DeleteAttractionModal.stories.tsx
│   │   │   │   │   ├── DeleteAttractionModal.tsx
│   │   │   │   │   ├── DeleteEventModal.stories.tsx
│   │   │   │   │   ├── DeleteEventModal.tsx
│   │   │   │   │   ├── EditAttractionModal.stories.tsx
│   │   │   │   │   ├── EditAttractionModal.tsx
│   │   │   │   │   ├── EditEventModal.stories.tsx
│   │   │   │   │   ├── EditEventModal.tsx
│   │   │   │   │   ├── EventsManagementCard.stories.tsx
│   │   │   │   │   ├── EventsManagementCard.tsx
│   │   │   │   │   ├── EventsManagementFilter.stories.tsx
│   │   │   │   │   ├── EventsManagementFilter.tsx
│   │   │   │   │   ├── EventsManagementTable.stories.tsx
│   │   │   │   │   ├── EventsManagementTable.tsx
│   │   │   │   │   ├── EventsTablePagination.stories.tsx
│   │   │   │   │   └── EventsTablePagination.tsx
│   │   │   │   │
│   │   │   │   ├── pages/
│   │   │   │   │   └── EventsManagement.tsx
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── users-management/
│   │   │   │   ├── components/
│   │   │   │   │   ├── DeleteUserModal.stories.tsx
│   │   │   │   │   ├── DeleteUserModal.tsx
│   │   │   │   │   ├── EditUserModal.stories.tsx
│   │   │   │   │   └── EditUserModal.tsx
│   │   │   │   │
│   │   │   │   ├── pages/
│   │   │   │   │   └── UsersManagement.tsx
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── authentication/
│   │   │   ├── components/
│   │   │   │   ├── AuthenticationScreenShell.stories.tsx
│   │   │   │   └── AuthenticationScreenShell.tsx
│   │   │   │
│   │   │   ├── context/
│   │   │   │   └── AuthenticationContext.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useAuthenticationContext.ts
│   │   │   │   ├── usePasswordReset.ts
│   │   │   │   └── useSession.ts
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── Authentication.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   └── PasswordReset.tsx
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── profile.ts
│   │   │   │   └── sessionUser.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── bar/
│   │   │   ├── components/
│   │   │   │   ├── BarSection.stories.tsx
│   │   │   │   ├── BarSection.tsx
│   │   │   │   ├── MotionCard.stories.tsx
│   │   │   │   ├── MotionCard.tsx
│   │   │   │   ├── ProductCard.stories.tsx
│   │   │   │   └── ProductCard.tsx
│   │   │   │
│   │   │   ├── context/
│   │   │   │   └── BarContext.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useBarContext.ts
│   │   │   │   └── useProducts.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── category.ts
│   │   │   │   └── product.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── productCategories.ts
│   │   │   │   └── productCategoryIcons.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── cart/
│   │   │   ├── components/
│   │   │   │   ├── CartDrawer.stories.tsx
│   │   │   │   ├── CartDrawer.tsx
│   │   │   │   ├── CartItemCard.stories.tsx
│   │   │   │   └── CartItemCard.tsx
│   │   │   │
│   │   │   ├── context/
│   │   │   │   └── CartContext.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useCartContext.ts
│   │   │   │   └── useCartItems.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── cartServices.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   └── cartItem.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── events/
│   │   │   ├── agenda/
│   │   │   │   ├── components/
│   │   │   │   │   ├── CalendarGrid.stories.tsx
│   │   │   │   │   ├── CalendarGrid.tsx
│   │   │   │   │   ├── CalendarHeader.stories.tsx
│   │   │   │   │   └── CalendarHeader.tsx
│   │   │   │   │
│   │   │   │   ├── context/
│   │   │   │   │   └── CalendarContext.tsx
│   │   │   │   │
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useCalendarContext.ts
│   │   │   │   │
│   │   │   │   ├── pages/
│   │   │   │   │   └── Schedule.tsx
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── event/
│   │   │   │   ├── components/
│   │   │   │   │   ├── EventCard.stories.tsx
│   │   │   │   │   ├── EventCard.tsx
│   │   │   │   │   ├── EventListItem.stories.tsx
│   │   │   │   │   ├── EventListItem.tsx
│   │   │   │   │   ├── EventModal.stories.tsx
│   │   │   │   │   ├── EventModal.tsx
│   │   │   │   │   ├── EventsSection.stories.tsx
│   │   │   │   │   └── EventsSection.tsx
│   │   │   │   │
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useEvents.ts
│   │   │   │   │
│   │   │   │   ├── services/
│   │   │   │   │   └── eventsServices.ts
│   │   │   │   │
│   │   │   │   ├── types/
│   │   │   │   │   └── event.ts
│   │   │   │   │
│   │   │   │   ├── utils/
│   │   │   │   │   ├── dayNames.ts
│   │   │   │   │   ├── eventTags.ts
│   │   │   │   │   └── monthNames.ts
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── gallery/
│   │   │   │   ├── components/
│   │   │   │   │   ├── GallerySection.stories.tsx
│   │   │   │   │   └── GallerySection.tsx
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── reviews/
│   │   │   │   ├── components/
│   │   │   │   │   ├── ReviewCard.stories.tsx
│   │   │   │   │   ├── ReviewCard.tsx
│   │   │   │   │   ├── ReviewsSection.stories.tsx
│   │   │   │   │   └── ReviewsSection.tsx
│   │   │   │   │
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useReviews.ts
│   │   │   │   │
│   │   │   │   ├── services/
│   │   │   │   │   └── reviewServices.ts
│   │   │   │   │
│   │   │   │   ├── types/
│   │   │   │   │   └── reviews.ts
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   └── users/
│   │       ├── profiles/
│   │       │   ├── components/
│   │       │   │   ├── EditProfileModal.stories.tsx
│   │       │   │   ├── EditProfileModal.tsx
│   │       │   │   ├── FirstTimeProfileModal.stories.tsx
│   │       │   │   ├── FirstTimeProfileModal.tsx
│   │       │   │   ├── ProfileInformationsSection.stories.tsx
│   │       │   │   ├── ProfileInformationsSection.tsx
│   │       │   │   ├── ProfileSettingsSection.stories.tsx
│   │       │   │   ├── ProfileSettingsSection.tsx
│   │       │   │   ├── ProfileTicketsSection.stories.tsx
│   │       │   │   └── ProfileTicketsSection.tsx
│   │       │   │
│   │       │   ├── context/
│   │       │   │   └── ProfileContext.tsx
│   │       │   │
│   │       │   ├── hooks/
│   │       │   │   ├── useProfile.ts
│   │       │   │   └── useProfileContext.ts
│   │       │   │
│   │       │   ├── pages/
│   │       │   │   └── UserProfile.tsx
│   │       │   │
│   │       │   └── index.ts
│   │       │
│   │       ├── tickets/
│   │       │   ├── hooks/
│   │       │   │   └── useTickets.ts
│   │       │   │
│   │       │   ├── services/
│   │       │   │   └── ticketsServices.ts
│   │       │   │
│   │       │   ├── types/
│   │       │   │   └── ticket.ts
│   │       │   │
│   │       │   └── index.ts
│   │       │
│   │       └── index.ts
│   │
│   ├── lib/
│   │   ├── validations/
│   │   │   ├── admin/
│   │   │   │   ├── analytics-management/
│   │   │   │   │   ├── newVisitorsSchema.ts
│   │   │   │   │   ├── ticketIncomeSchema.ts
│   │   │   │   │   └── voucherIncomeSchema.ts
│   │   │   │   │
│   │   │   │   ├── bar-management/
│   │   │   │   │   ├── createProductSchema.ts
│   │   │   │   │   └── editProductSchema.ts
│   │   │   │   │
│   │   │   │   ├── events-management/
│   │   │   │   │   ├── createAttractionSchema.ts
│   │   │   │   │   ├── createEventSchema.ts
│   │   │   │   │   ├── editAttractionSchema.ts
│   │   │   │   │   └── editEventSchema.ts
│   │   │   │   │
│   │   │   │   └── user-management/
│   │   │   │       └── editUserSchema.ts
│   │   │   │
│   │   │   ├── authentication/
│   │   │   │   ├── passwordResetSchemas.ts
│   │   │   │   ├── signInSchema.ts
│   │   │   │   └── signUpSchema.ts
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   └── cartItemSchema.ts
│   │   │   │
│   │   │   ├── events/
│   │   │   │   ├── createReviewSchema.ts
│   │   │   │   └── updateReviewSchema.ts
│   │   │   │
│   │   │   ├── shared/
│   │   │   │   ├── imageFileSchema.ts
│   │   │   │   ├── periodSchema.ts
│   │   │   │   └── tagSchema.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── buyTicketsSchema.ts
│   │   │   │   ├── profileSchema.ts
│   │   │   │   └── updateProfileSchema.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── prisma.ts
│   │   └── resend.ts
│   │
│   ├── prisma/
│   │   ├── generated/
│   │   │
│   │   ├── migrations/
│   │   │   ├── 20260901224000_init/
│   │   │   │   └── migration.sql
│   │   │   │
│   │   │   ├── 20260908000137_adjusted_photo_field_inside_model_user_to_be_optional_and_declared_verified_badge_default_value_as_false/
│   │   │   │   └── migration.sql
│   │   │   │
│   │   │   ├── 20260909012722_added_unique_constraint_to_field_token_inside_model_user/
│   │   │   │   └── migration.sql
│   │   │   │
│   │   │   ├── 20260917194257_renamed_photo_to_profile_picture_on_model_user/
│   │   │   │   └── migration.sql
│   │   │   │
│   │   │   ├── 20260918200444_cpf_cep_and_uf_are_now_all_caps/
│   │   │   │   └── migration.sql
│   │   │   │
│   │   │   ├── 20260918203311_renamed_cpf_to_social_security_number_cep_to_zip_code_and_uf_to_state/
│   │   │   │   └── migration.sql
│   │   │   │
│   │   │   └── migration_lock.toml
│   │   │
│   │   └── schema.prisma
│   │
│   └── shared/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AdminHeader.stories.tsx
│       │   │   ├── AdminHeader.tsx
│       │   │   ├── Footer.stories.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── Header.stories.tsx
│       │   │   ├── Header.tsx
│       │   │   ├── HeroSection.stories.tsx
│       │   │   ├── HeroSection.tsx
│       │   │   ├── ProfileHeader.stories.tsx
│       │   │   └── ProfileHeader.tsx
│       │   │
│       │   ├── ui/
│       │   │   ├── CustomPasswordInput.stories.tsx
│       │   │   ├── CustomPasswordInput.tsx
│       │   │   ├── CustomTextInput.stories.tsx
│       │   │   └── CustomTextInput.tsx
│       │   │
│       │   └── index.ts
│       │
│       ├── context/
│       │   ├── index.ts
│       │   ├── MobileContext.tsx
│       │   └── ThemeContext.tsx
│       │
│       ├── emails/
│       │   ├── PasswordResetEmail.stories.tsx
│       │   └── PasswordResetEmail.tsx
│       │
│       ├── hooks/
│       │   ├── index.ts
│       │   ├── useBlockScroll.ts
│       │   ├── useMobileContext.ts
│       │   └── useThemeContext.ts
│       │
│       ├── pages/
│       │   ├── content-pages/
│       │   │   ├── Admin.tsx
│       │   │   └── MainContent.tsx
│       │   │
│       │   ├── footer-links/
│       │   │   ├── About.tsx
│       │   │   ├── FrequentlyAskedQuestions.tsx
│       │   │   ├── HelpingCentral.tsx
│       │   │   ├── PrivacyPolicy.tsx
│       │   │   ├── RefundPolicy.tsx
│       │   │   ├── TermsOfUse.tsx
│       │   │   └── WorkWithUs.tsx
│       │   │
│       │   └── index.ts
│       │
│       ├── providers/
│       │   └── QueryProvider.tsx
│       │
│       └── utils/
│           ├── constants/
│           │   ├── badges.ts
│           │   ├── photos.ts
│           │   ├── regex.ts
│           │   └── rotatingImages.ts
│           │
│           ├── functions/
│           │   ├── atLeastOneFieldUpdated.ts
│           │   ├── dates.ts
│           │   ├── masks.ts
│           │   └── theme.ts
│           │
│           └── index.ts
│
├── supabase/
│   └── supabase.ts
│
├── .env.local
├── .gitignore
├── eslint.config.js
├── globals.d.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.ts
├── prisma.config.ts
├── README.md
├── skills-lock.json
├── tsconfig.json
├── vite.config.ts
└── vitest.shims.d.ts
```

---

## 📌 Observações

O projeto está em desenvolvimento ativo.  
As Server Actions de compra e cancelamento de ingressos e vouchers já estão implementadas, mas a integração com a interface (checkout e página de pedidos) ainda está em andamento.  
O painel de analytics e alguns fluxos administrativos também estão sendo finalizados, e uma refatoração do projeto está em andamento.

---

## 📄 Licença

Este projeto é livre para fins de estudo, aprendizado e uso pessoal.
