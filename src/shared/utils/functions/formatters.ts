// 1. Formata um valor em reais

const formatCurrency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// 2. Formata uma quantidade de pessoas

const formatPeople = (value: number) => `${value} ${value === 1 ? "pessoa" : "pessoas"}`;

export { formatCurrency, formatPeople };
