import { fakeUsers } from "./useUsers";

const useUsersStats = () => ({
  stats: {
    total: fakeUsers.length,
    admins: fakeUsers.filter((user) => user.role === "admin").length,
    verified: fakeUsers.filter((user) => user.verifiedBadge).length,
    notValidated: fakeUsers.filter((user) => user.validatedAt === null).length,
  },
  isLoading: false,
  error: null,
});

export { useUsersStats };