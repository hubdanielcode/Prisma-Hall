import { fn } from "storybook/test";
import type { ProductProps } from "@/features/bar/types/product";

const fakeProducts: ProductProps[] = [
  {
    id: "id-do-produto-fake-1",
    name: "Produto Fake 01",
    description: "Descrição do primeiro produto fake, serve apenas para o mock",
    category: "beers",
    quantity: 10,
    image:
      "https://plus.unsplash.com/premium_photo-1669349127520-fa1e30b02055?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 21,
    status: "active",

    createdAt: new Date("2026-08-01").toISOString(),
    updatedAt: new Date("2026-08-01").toISOString(),
  },

  {
    id: "id-do-produto-fake-2",
    name: "Produto Fake 02",
    description: "Descrição do segundo produto fake, serve apenas para o mock",
    category: "beers",
    quantity: 10,
    image:
      "https://plus.unsplash.com/premium_photo-1669349129088-002df7abca61?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 18.5,
    status: "inactive",

    createdAt: new Date("2026-08-03").toISOString(),
    updatedAt: new Date("2026-08-03").toISOString(),
  },

  {
    id: "id-do-produto-fake-3",
    name: "Produto Fake 03",
    description: "Descrição do terceiro produto fake, serve apenas para o mock",
    category: "cocktails",
    quantity: 10,
    image:
      "https://plus.unsplash.com/premium_photo-1669349127566-9be644ceac6e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8M3xlbnwwfHwwfHx8MA%3D%3D",
    price: 24,
    status: "active",

    createdAt: new Date("2026-08-05").toISOString(),
    updatedAt: new Date("2026-08-05").toISOString(),
  },

  {
    id: "id-do-produto-fake-4",
    name: "Produto Fake 04",
    description: "Descrição do quarto produto fake, serve apenas para o mock",
    category: "cocktails",
    quantity: 10,
    image:
      "https://images.unsplash.com/photo-1790468354600-68bed467d84c?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 28,
    status: "active",

    createdAt: new Date("2026-08-07").toISOString(),
    updatedAt: new Date("2026-08-07").toISOString(),
  },

  {
    id: "id-do-produto-fake-5",
    name: "Produto Fake 05",
    description: "Descrição do quinto produto fake, serve apenas para o mock",
    category: "drinks",
    quantity: 10,
    image:
      "https://plus.unsplash.com/premium_photo-1669349127530-23d9e3dab307?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 35,
    status: "active",

    createdAt: new Date("2026-08-10").toISOString(),
    updatedAt: new Date("2026-08-10").toISOString(),
  },

  {
    id: "id-do-produto-fake-6",
    name: "Produto Fake 06",
    description: "Descrição do sexto produto fake, serve apenas para o mock",
    category: "drinks",
    quantity: 10,
    image:
      "https://plus.unsplash.com/premium_photo-1669349127561-6e8ae10b8642?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 30,
    status: "inactive",

    createdAt: new Date("2026-08-12").toISOString(),
    updatedAt: new Date("2026-08-12").toISOString(),
  },

  {
    id: "id-do-produto-fake-7",
    name: "Produto Fake 07",
    description: "Descrição do sétimo produto fake, serve apenas para o mock",
    category: "no_alcohol",
    quantity: 10,
    image:
      "https://plus.unsplash.com/premium_photo-1669349127571-ebf4a6cbdf69?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 12,
    status: "active",

    createdAt: new Date("2026-08-15").toISOString(),
    updatedAt: new Date("2026-08-15").toISOString(),
  },

  {
    id: "id-do-produto-fake-8",
    name: "Produto Fake 08",
    description: "Descrição do oitavo produto fake, serve apenas para o mock",
    category: "no_alcohol",
    quantity: 10,
    image:
      "https://plus.unsplash.com/premium_photo-1669349127580-968bafc64324?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9,
    status: "active",

    createdAt: new Date("2026-08-18").toISOString(),
    updatedAt: new Date("2026-08-18").toISOString(),
  },
];

const fakeProduct = fakeProducts[0];

const useProducts = () => ({
  products: fakeProducts,
  isLoading: false,
  error: null,
  createProductMutation: fn(),
  editProductMutation: fn(),
  deleteProductMutation: fn(),
  productBeingEdited: null,
  setProductBeingEdited: fn(),
  productBeingDeleted: null,
  setProductBeingDeleted: fn(),
});

export { useProducts, fakeProducts, fakeProduct };
