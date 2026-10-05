import { fn } from "storybook/test";
import type { UserProps } from "@/features/users/user/types/user";

const fakeUsers: UserProps[] = [
  {
    id: "id-do-usuario-fake-1",
    name: "Usuário Fake Um",
    email: "usuario.fake.1@gmail.com",
    role: "admin",
    verifiedBadge: true,
    frequentUser: "gold",
    oldUser: "silver",
    profilePicture:
      "https://plus.unsplash.com/premium_photo-1669349127520-fa1e30b02055?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    validatedAt: new Date("2026-01-10").toISOString(),

    createdAt: new Date("2026-01-10").toISOString(),
    updatedAt: new Date("2026-01-10").toISOString(),
  },

  {
    id: "id-do-usuario-fake-2",
    name: "Usuário Fake Dois",
    email: "usuario.fake.2@hotmail.com",
    role: "user",
    verifiedBadge: false,
    frequentUser: "none",
    oldUser: "none",
    profilePicture:
      "https://plus.unsplash.com/premium_photo-1669349129088-002df7abca61?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    validatedAt: null,

    createdAt: new Date("2026-02-03").toISOString(),
    updatedAt: new Date("2026-02-03").toISOString(),
  },

  {
    id: "id-do-usuario-fake-3",
    name: "Usuário Fake Três",
    email: "usuario.fake.3@outlook.com",
    role: "user",
    verifiedBadge: true,
    frequentUser: "bronze",
    oldUser: "none",
    profilePicture:
      "https://plus.unsplash.com/premium_photo-1669349127566-9be644ceac6e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8M3xlbnwwfHwwfHx8MA%3D%3D",
    validatedAt: new Date("2026-03-15").toISOString(),

    createdAt: new Date("2026-03-15").toISOString(),
    updatedAt: new Date("2026-03-15").toISOString(),
  },

  {
    id: "id-do-usuario-fake-4",
    name: "Usuário Fake Quatro",
    email: "usuario.fake.4@yahoo.com",
    role: "user",
    verifiedBadge: false,
    frequentUser: "silver",
    oldUser: "bronze",
    profilePicture:
      "https://images.unsplash.com/photo-1790468354600-68bed467d84c?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    validatedAt: new Date("2026-04-20").toISOString(),

    createdAt: new Date("2026-04-20").toISOString(),
    updatedAt: new Date("2026-04-20").toISOString(),
  },

  {
    id: "id-do-usuario-fake-5",
    name: "Usuário Fake Cinco",
    email: "usuario.fake.5@gmail.com",
    role: "user",
    verifiedBadge: false,
    frequentUser: "none",
    oldUser: "gold",
    profilePicture:
      "https://plus.unsplash.com/premium_photo-1669349127530-23d9e3dab307?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    validatedAt: null,

    createdAt: new Date("2026-05-02").toISOString(),
    updatedAt: new Date("2026-05-02").toISOString(),
  },

  {
    id: "id-do-usuario-fake-6",
    name: "Usuário Fake Seis",
    email: "usuario.fake.6@gmail.com",
    role: "user",
    verifiedBadge: true,
    frequentUser: "gold",
    oldUser: "gold",
    profilePicture:
      "https://plus.unsplash.com/premium_photo-1669349127561-6e8ae10b8642?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    validatedAt: new Date("2026-06-11").toISOString(),

    createdAt: new Date("2026-06-11").toISOString(),
    updatedAt: new Date("2026-06-11").toISOString(),
  },

  {
    id: "id-do-usuario-fake-7",
    name: "Usuário Fake Sete",
    email: "usuario.fake.7@hotmail.com.br",
    role: "user",
    verifiedBadge: false,
    frequentUser: "none",
    oldUser: "none",
    profilePicture:
      "https://plus.unsplash.com/premium_photo-1669349127571-ebf4a6cbdf69?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    validatedAt: new Date("2026-07-07").toISOString(),

    createdAt: new Date("2026-07-07").toISOString(),
    updatedAt: new Date("2026-07-07").toISOString(),
  },
];

const fakeUser = fakeUsers[0];

const useUsers = () => ({
  users: fakeUsers,
  isLoading: false,
  error: null,
  editUserMutation: fn(),
  deleteUserMutation: fn(),
  userBeingEdited: fakeUser,
  setUserBeingEdited: fn(),
  userBeingDeleted: null,
  setUserBeingDeleted: fn(),
});

export { useUsers, fakeUsers, fakeUser };
