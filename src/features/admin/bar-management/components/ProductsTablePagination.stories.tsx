import { useState } from "react";
import { ProductsTablePagination } from "./ProductsTablePagination";

export default {
  title: "Layouts/Admin/Bar Management/Table",
  component: ProductsTablePagination,
};

const TablePagination = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 3;

  return (
    <ProductsTablePagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
};

export { TablePagination as "Products Table Pagination" };
