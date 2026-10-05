import { AttractionProvider } from "@/features/events/event/context/AttractionContext";
import { AttractionsManagementList } from "./AttractionsManagementList";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management",
  component: AttractionsManagementList,
  parameters: {
    layout: "fullscreen",
  },
};

const AttractionsList = () => {
  return (
    <QueryProvider>
      <AttractionProvider>
        <div className="bg-[#1A1A1A] p-8">
          <AttractionsManagementList />
        </div>
      </AttractionProvider>
    </QueryProvider>
  );
};

export { AttractionsList as "Attractions List" };
