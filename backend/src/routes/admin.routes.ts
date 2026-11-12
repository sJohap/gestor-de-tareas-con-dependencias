import { Router } from "express";
import { listUsersController } from "../controllers/admin.controller";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

export const adminRouter = Router();

adminRouter.get("/admin/users", requireAuth, requireRole("admin"), (req, res, next) => {
  listUsersController(req, res).catch(next);
});
