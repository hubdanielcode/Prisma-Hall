const roleBadgeLabels = {
  user: "Usuário",
  admin: "Administrador",
};

const roleBadgeOptions = [
  { id: "user", title: "Usuário" },
  { id: "admin", title: "Administrador" },
] as const;

const roleBadgeStyles = {
  user: {
    background: "bg-blue-950",
    border: "border-blue-700",
    text: "text-blue-400",
  },

  admin: {
    background: "bg-[#3D2B0A]",
    border: "border-[#B8860B]",
    text: "text-[#B8860B]",
  },
};

export { roleBadgeLabels, roleBadgeOptions, roleBadgeStyles };
