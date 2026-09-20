import { fn } from "storybook/test";
import type { ProductProps } from "@/features/bar/types/product";

const fakeProducts: ProductProps[] = [
  {
    id: "id-do-produto-fake-1",
    name: "Heineken 600ml",
    description: "Cerveja long neck 600ml, importada, puro malte e sabor suave.",
    category: "beers",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=400&fit=crop",
    price: 21,
    status: "active",
    createdAt: new Date("2026-08-01").toISOString(),
    updatedAt: new Date("2026-08-01").toISOString(),
  },

  {
    id: "id-do-produto-fake-2",
    name: "Chopp Artesanal",
    description: "Chopp artesanal gelado, tirado na hora, servido em copo de 500ml.",
    category: "beers",
    image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=400&fit=crop",
    price: 18.5,
    status: "inactive",
    createdAt: new Date("2026-08-03").toISOString(),
    updatedAt: new Date("2026-08-03").toISOString(),
  },

  {
    id: "id-do-produto-fake-3",
    name: "Caipirinha de Limão",
    description: "Clássica caipirinha com limão tahiti, açúcar e cachaça artesanal.",
    category: "cocktails",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=400&fit=crop",
    price: 24,
    status: "active",
    createdAt: new Date("2026-08-05").toISOString(),
    updatedAt: new Date("2026-08-05").toISOString(),
  },

  {
    id: "id-do-produto-fake-4",
    name: "Mojito Tropical",
    description: "Rum, hortelã fresca, limão e água com gás, finalizado com gelo.",
    category: "cocktails",
    image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=400&fit=crop",
    price: 28,
    status: "active",
    createdAt: new Date("2026-08-07").toISOString(),
    updatedAt: new Date("2026-08-07").toISOString(),
  },

  {
    id: "id-do-produto-fake-5",
    name: "Whisky Doze Anos",
    description: "Dose de whisky envelhecido por doze anos, servido com gelo.",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=400&fit=crop",
    price: 35,
    status: "active",
    createdAt: new Date("2026-08-10").toISOString(),
    updatedAt: new Date("2026-08-10").toISOString(),
  },

  {
    id: "id-do-produto-fake-6",
    name: "Gin Tônica",
    description: "Gin premium com água tônica, rodela de limão e especiarias.",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=400&fit=crop",
    price: 30,
    status: "inactive",
    createdAt: new Date("2026-08-12").toISOString(),
    updatedAt: new Date("2026-08-12").toISOString(),
  },

  {
    id: "id-do-produto-fake-7",
    name: "Suco de Maracujá",
    description: "Suco natural de maracujá, feito na hora e sem adição de açúcar.",
    category: "no_alcohol",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=400&fit=crop",
    price: 12,
    status: "active",
    createdAt: new Date("2026-08-15").toISOString(),
    updatedAt: new Date("2026-08-15").toISOString(),
  },

  {
    id: "id-do-produto-fake-8",
    name: "Água Tônica Zero",
    description: "Água tônica zero açúcar, gelada, servida em lata de 350ml.",
    category: "no_alcohol",
    image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=400&fit=crop",
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
