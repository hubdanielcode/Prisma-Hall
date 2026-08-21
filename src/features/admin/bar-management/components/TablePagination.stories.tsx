import { useState } from "react";
import { TablePagination } from "./TablePagination";

export default {
  title: "Admin/Admin Page/Bar Management",
  component: TablePagination,
};

const ProductTablePagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  return (
    <TablePagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
};

export { ProductTablePagination as "Table Pagination" };
