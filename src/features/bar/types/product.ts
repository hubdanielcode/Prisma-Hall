export type ProductProps = {
  id: string;
  name: string;
  category: "all_categories" | "beers" | "cocktails" | "drinks" | "no_alcohol";
  description: string;
  image: string;
  price: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};
