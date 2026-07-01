export interface ProductProps {
  product_id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  status: "Ativo" | "Inativo";

  created_at: string;
}
