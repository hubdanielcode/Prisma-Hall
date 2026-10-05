const paymentStatusBadgeStyles = {
  Pago: {
    background: "bg-green-950",
    border: "border-green-700",
    text: "text-green-400",
  },

  "Pagamento pendente": {
    background: "bg-yellow-950",
    border: "border-yellow-700",
    text: "text-yellow-400",
  },

  "Pagamento falhou": {
    background: "bg-red-950",
    border: "border-red-700",
    text: "text-red-400",
  },

  Reembolsado: {
    background: "bg-purple-950",
    border: "border-purple-700",
    text: "text-purple-400",
  },
};

const pickupStatusBadgeStyles = {
  Retirado: {
    background: "bg-blue-950",
    border: "border-blue-700",
    text: "text-blue-400",
  },

  "Não retirado": {
    background: "bg-zinc-900",
    border: "border-zinc-700",
    text: "text-zinc-400",
  },
};

const orderStatusBadgeStyles = {
  "Pedido confirmado": {
    background: "bg-green-950",
    border: "border-green-700",
    text: "text-green-400",
  },

  "Pedido pendente": {
    background: "bg-yellow-950",
    border: "border-yellow-700",
    text: "text-yellow-400",
  },

  "Pedido cancelado": {
    background: "bg-red-950",
    border: "border-red-700",
    text: "text-red-400",
  },
};

export { paymentStatusBadgeStyles, pickupStatusBadgeStyles, orderStatusBadgeStyles };
