const regex = {
  /* - Autenticação - */

  name: /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ'-]+)+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,50}$/,

  /* - Perfil - */

  phoneNumber: /^\(\d{2}\)\s9\d{4}-\d{4}$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  birthDate: /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
  CEP: /^\d{5}-\d{3}$/,
  city: /^[A-Za-zÀ-ÿ\s'-]{2,50}$/,
  UF: /^[A-Z]{2}$/,
  neighborhood: /^[A-Za-zÀ-ÿ0-9\s'-]{2,60}$/,
  street: /^[A-Za-zÀ-ÿ0-9\s'.,\-]{2,50}$/,
  number: /^\d{1,7}$/,
  complement: /^[A-Za-zÀ-ÿ0-9\s'.,\-]{1,25}$/,

  /* - Produto - */

  productName: /^(?!.*[\p{Emoji_Presentation}\p{Extended_Pictographic}]).{1,30}$/u,
  productDescription: /^(?!.*[\p{Emoji_Presentation}\p{Extended_Pictographic}]).{1,100}$/u,
  productPrice: /^\d+,?\d*$/,

  /* - Evento - */

  eventTitle: /^(?!.*[\p{Emoji_Presentation}\p{Extended_Pictographic}]).{1,30}$/u,
  eventDescription: /^(?!.*[\p{Emoji_Presentation}\p{Extended_Pictographic}]).{1,100}$/u,
  eventArtist: /^(?!.*[\p{Emoji_Presentation}\p{Extended_Pictographic}]).{1,100}$/u,

  /* - Review - */

  reviewComment: /^(?!.*[\p{Emoji_Presentation}\p{Extended_Pictographic}]).{0,150}$/u,
};

export { regex };
