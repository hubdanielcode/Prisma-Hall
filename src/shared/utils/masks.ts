const masks = {
  /* - Autenticação - */

  fullName: (value: string) =>
    value
      .replace(/[^A-Za-zÀ-ÿ '-]/g, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, 50)
      .replace(/\b([A-Za-zÀ-ÿ]+)\b/g, (word) => {
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

  phoneNumber: (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2"),

  UF: (value: string) =>
    value
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase()
      .slice(0, 2),

  number: (value: string) => value.replace(/\D/g, "").slice(0, 4),

  city: (value: string) => value.replace(/[^A-Za-zÀ-ÿ '\-]/g, "").slice(0, 50),

  neighborhood: (value: string) =>
    value.replace(/[^A-Za-zÀ-ÿ0-9 '\-]/g, "").slice(0, 60),

  street: (value: string) =>
    value.replace(/[^A-Za-zÀ-ÿ0-9 '\-,.]/g, "").slice(0, 50),

  complement: (value: string) =>
    value.replace(/[^A-Za-zÀ-ÿ0-9 '\-,.]/g, "").slice(0, 25),
};

export { masks };
