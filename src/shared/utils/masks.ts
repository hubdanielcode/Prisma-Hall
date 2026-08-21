const masks = {
  /* - Autenticação - */

  fullName: (value: string) =>
    value
      .replace(/[^\p{L} '-]/gu, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, 50)
      .replace(/\b(\p{L}+)\b/gu, (word) => {
        const exceptions = new Set(["da", "de", "do", "das", "dos", "e"]);
        return exceptions.has(word.toLowerCase())
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }),

  email: (value: string) =>
    value
      .replace(/[^a-zA-Z0-9._%+\-@]/g, "")
      .replace(/@{2,}/g, "@")
      .replace(/\.{2,}/g, ".")
      .toLowerCase()
      .slice(0, 50),

  /* - Perfil - */

  CPF: (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2"),

  birthDate: (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2"),

  phoneNumber: (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length > 10) {
      return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
    }

    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  },

  UF: (value: string) =>
    value
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase()
      .slice(0, 2),

  number: (value: string) => value.replace(/\D/g, "").slice(0, 4),

  city: (value: string) => value.replace(/[^\p{L} '\-]/gu, "").slice(0, 50),

  neighborhood: (value: string) =>
    value.replace(/[^\p{L}0-9 '\-]/gu, "").slice(0, 60),

  street: (value: string) =>
    value.replace(/[^\p{L}0-9 '\-,.]/gu, "").slice(0, 50),

  complement: (value: string) =>
    value.replace(/[^\p{L}0-9 '\-,.]/gu, "").slice(0, 25),

  /* - Produto - */

  productName: (value: string) =>
    value
      .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, 50)
      .replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase()),

  productDescription: (value: string) =>
    value
      .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, 200)
      .replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase()),

  productPrice: (value: string) => {
    const onlyValid = value.replace(/[^\d,]/g, "");

    const [integerPart, ...rest] = onlyValid.split(",");

    if (rest.length === 0) {
      return integerPart;
    }

    const decimalPart = rest.join("").slice(0, 2);

    return `${integerPart},${decimalPart}`;
  },
};

export { masks };
