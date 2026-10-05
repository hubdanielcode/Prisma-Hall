import { useState } from "react";
import { UsersTablePagination } from "./UsersTablePagination";

export default {
  title: "Layouts/Admin/Users Management/Table",
  component: UsersTablePagination,
  parameters: {
    layout: "fullscreen",
  },
};

const TablePagination = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 3;

  return (
    <UsersTablePagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
};

export { TablePagination as "Users Table Pagination" };
