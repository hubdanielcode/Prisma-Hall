/* - Quantas horas antes do início do evento o pedido de ingressos ainda pode ser cancelado. Se mudar este valor, atualize também a Política de Reembolso e o FAQ - */

const ticketCancellationDeadlineHours = 24;

/* - Momento limite para cancelar os ingressos de um evento - */

const getTicketCancellationDeadline = (startsAt: Date | string) => {
  return new Date(new Date(startsAt).getTime() - ticketCancellationDeadlineHours * 60 * 60 * 1000);
};

/* - O cancelamento só é aceito antes do prazo; depois dele (ou com o evento já realizado) não é mais - */

const isTicketCancellationOpen = (startsAt: Date | string) => {
  return Date.now() < getTicketCancellationDeadline(startsAt).getTime();
};

export { getTicketCancellationDeadline, isTicketCancellationOpen, ticketCancellationDeadlineHours };
