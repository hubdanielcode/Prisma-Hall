/* - Quantos minutos depois de criada a avaliação ainda pode ser editada. Excluir continua liberado a qualquer momento - */

const reviewEditWindowMinutes = 3;

/* - Momento limite para editar uma avaliação - */

const getReviewEditDeadline = (createdAt: Date | string) => {
  return new Date(new Date(createdAt).getTime() + reviewEditWindowMinutes * 60 * 1000);
};

/* - A edição só é aceita até o prazo; depois dele não é mais - */

const isReviewEditOpen = (createdAt: Date | string) => {
  return Date.now() < getReviewEditDeadline(createdAt).getTime();
};

export { getReviewEditDeadline, isReviewEditOpen, reviewEditWindowMinutes };
