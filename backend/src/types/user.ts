export type UserRole = "user" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

export type UserWithPassword = User & {
  passwordHash: string;
};

export type NewUser = {
  name: string;
  email: string;
  passwordHash: string;
};
