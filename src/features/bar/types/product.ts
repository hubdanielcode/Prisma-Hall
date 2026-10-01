export type ProductProps = {
  id: string;
  name: string;
  description: string;
  category: "beers" | "cocktails" | "drinks" | "no_alcohol";
  quantity: number;
  image: string;
  price: number;
  status: "active" | "inactive";

  createdAt: string;
  updatedAt: string;
};
