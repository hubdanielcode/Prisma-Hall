import { fakeUsers } from "../../../../../.storybook/mocks/hooks/users/useUsers";
import { UserAvatar } from "./UserAvatar";

export default {
  title: "Layouts/Admin/Users Management",
  component: UserAvatar,
  parameters: {
    layout: "fullscreen",
  },
};

const Avatars = () => {
  return (
    <div className="flex items-center gap-4 bg-[#1A1A1A] p-6">
      <UserAvatar user={fakeUsers[0]} />
    </div>
  );
};

export { Avatars as "User Avatar" };
