import { fn } from "storybook/test";
import type { SessionUserProps } from "@/features/authentication/types/sessionUser";

const fakeSessionUser: SessionUserProps = {
  id: "Qualquer-id-fake",
  name: "Maria Aparecida da Silva Sauro",
  email: "maria.sauro@email.com",
  role: "user",
};

const fakeSession = {
  id: "Qualquer-session-id-fake",
  userId: fakeSessionUser.id,
  createdAt: new Date("2026-10-01"),
  revokedAt: null,
  expiresAt: new Date("2026-12-31"),
  lastActivityAt: new Date("2026-10-20"),
};

const useSession = () => ({
  session: fakeSession,
  user: fakeSessionUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  signInMutation: fn(),
  signUpMutation: fn(),
  revokeSessionMutation: fn(),
  invalidateAllSessionQueries: fn(async () => {}),
});

export { useSession, fakeSession, fakeSessionUser };
