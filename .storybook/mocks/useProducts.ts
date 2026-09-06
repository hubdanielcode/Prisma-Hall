import { fn } from "storybook/test";

const useProducts = () => ({
  products: [],
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

export { useProducts };
