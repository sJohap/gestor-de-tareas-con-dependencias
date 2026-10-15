import { DatabaseError } from "pg";
import { findUserByEmail, insertUser } from "../repositories/user.repository";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";
import type { User } from "../types/user";
import { HttpError } from "../utils/http-error";
import { hashPassword, verifyPassword } from "../utils/password";

const UNIQUE_VIOLATION = "23505";

export async function registerUser(input: RegisterInput): Promise<User> {
  const passwordHash = await hashPassword(input.password);

  try {
    return await insertUser({
      name: input.name,
      email: input.email,
      passwordHash,
    });
  } catch (error) {
    if (error instanceof DatabaseError && error.code === UNIQUE_VIOLATION) {
      throw new HttpError(409, "Ese correo ya está registrado");
    }
    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<User> {
  const user = await findUserByEmail(input.email);

  if (!user || !(await verifyPassword(user.passwordHash, input.password))) {
    throw new HttpError(401, "Correo o contraseña incorrectos");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
