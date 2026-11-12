import type { Request, Response } from "express";
import { listUsers } from "../repositories/user.repository";

export async function listUsersController(_req: Request, res: Response): Promise<void> {
  const users = await listUsers();
  res.status(200).json({ users });
}
