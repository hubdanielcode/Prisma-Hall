import { ProfileTicketsSection } from "./ProfileTicketsSection";

export default {
  title: "Layouts/Protected/Profile/Sections",
  component: ProfileTicketsSection,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

const ProfileTicketsTab = () => {
  /* - Criando usuários e eventos falsos para  - */

  const fakeUser = {
    id: "id-do-usuário-fake",
    name: "Maria Aparecida da Silva Sauro",
    email: "mariadinossaura.aparecida@gmail.com",
    role: "user" as const,
  };

  const fakeEvent = {
    event_id: "id-do-event-fake",
    event_name: "Festival Sunset Salvador",
    title: "Festival Sunset Salvador",
    description: "Uma tarde especial com música ao vivo, DJs, gastronomia e uma vista incrível do pôr do sol.",
    artist: "DJ Marina Costa",
    starts_at: "2026-10-10T17:00:00-03:00",
    price: 75,
    attendees: 320,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    tag: "Música" as const,
    status: "Active" as const,
    created_at: "2026-09-15T10:30:00-03:00",
  };

  const ProfileTicketsTabContent = () => {
    return (
      <div className="bg-[#1A1A1A] text-white font-semibold min-h-screen max-w-full">
        <ProfileTicketsSection />
      </div>
    );
  };
};

export { ProfileTicketsTab as "Profile Tickets Section" };
