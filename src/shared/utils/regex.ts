const regex = {
  /* - Autenticação - */

  name: /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ'-]+)+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  /* - Perfil - */

  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  birthDate: /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
  phoneNumber: /^\(\d{2}\)\s9\d{4}-\d{4}$/,
  UF: /^[A-Z]{2}$/,
  number: /^\d{1,4}$/,
  city: /^[A-Za-zÀ-ÿ\s'-]{2,50}$/,
  neighborhood: /^[A-Za-zÀ-ÿ0-9\s'-]{2,60}$/,
  street: /^[A-Za-zÀ-ÿ0-9\s'.,\-]{2,50}$/,
  complement: /^[A-Za-zÀ-ÿ0-9\s'.,\-]{1,25}$/,
};

export { regex };
