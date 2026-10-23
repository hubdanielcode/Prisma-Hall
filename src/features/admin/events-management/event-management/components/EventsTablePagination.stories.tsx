import { EventsTablePagination } from "./EventsTablePagination";
import { useState } from "react";

export default {
  title: "Layouts/Admin/Events Management/Table",
  component: EventsTablePagination,
  parameters: {
    layout: "fullscreen",
  },
};

const TablePagination = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 3;

  return (
    <EventsTablePagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
};

export { TablePagination as "Events Table Pagination" };
