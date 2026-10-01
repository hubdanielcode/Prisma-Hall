import { EventProvider } from "@/features/events/event/context/EventContext";
import { Admin } from "@/shared/pages/content-pages/Admin";

const AdminPage = () => {
  return (
    <EventProvider>
      <Admin />;
    </EventProvider>
  );
};

export default AdminPage;
