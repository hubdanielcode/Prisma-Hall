// O QUE ESSA ACTION PRECISA FAZER?

// 3. CONVERTER O PERIOD NUM INTERVALO DE DATAS REAL (gte/lte)
//    - Ainda não existe um util pra isso no projeto: decidir se nasce aqui dentro ou vira compartilhado

// 4. CONTAR OS NOVOS USUÁRIOS NO PERÍODO
//   - User.validatedAt dentro do intervalo do passo 3

// 5. DOS USUÁRIOS DO PASSO 4, CONTAR QUANTOS COMPRARAM INGRESSO
//   - Tem que ter pelo menos 1 TicketOrder com status: confirmed
//   - Contar USUÁRIOS distintos, não pedidos (1 usuário com 3 pedidos = 1 comprador)

// 6. DOS COMPRADORES DO PASSO 5, QUEBRAR POR TAG DE EVENTO
//   - Caminho: TicketOrder (confirmed) -> Ticket -> Event.tag
//   - Se tag === "all_tags": devolver a contagem quebrada por CADA tag
//   - Se tag for uma tag específica: devolver só a contagem daquela tag
//   - Decisão pendente: um usuário que comprou pra tags diferentes conta em mais de um grupo, ou só numa (qual critério de desempate)?

// 7. RETORNAR OS TRÊS NÚMEROS JUNTOS: novos usuários, compradores, quebra por tag
