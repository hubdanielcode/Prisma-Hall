const tierBadgeLabels = {
  none: "Nenhum",
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
};

const tierBadgeOptions = [
  { id: "none", title: "Nenhum" },
  { id: "bronze", title: "Bronze" },
  { id: "silver", title: "Prata" },
  { id: "gold", title: "Ouro" },
] as const;

const tierBadgeStyles = {
  none: {
    filterOptionBackground: "bg-white/20",
    filterOptionText: "text-white/40",
    tableIconColor: "text-transparent",
  },

  bronze: {
    filterOptionBackground: "bg-[#804A3C]",
    filterOptionText: "text-[#FEDFB8]",
    tableIconColor: "text-[#C17F63]",
  },

  silver: {
    filterOptionBackground: "bg-[#878C8F]",
    filterOptionText: "text-[#F4F6FB]",
    tableIconColor: "text-[#C0C0C0]",
  },

  gold: {
    filterOptionBackground: "bg-[#916329]",
    filterOptionText: "text-[#FFF9A6]",
    tableIconColor: "text-[#B8860B]",
  },
};

export { tierBadgeLabels, tierBadgeOptions, tierBadgeStyles };
