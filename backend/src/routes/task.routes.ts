import { Router } from "express";
import {
  addDependencyController,
  createTaskController,
  deleteTaskController,
  listTasksController,
  removeDependencyController,
  updateTaskController,
} from "../controllers/task.controller";
import { requireAuth } from "../middlewares/require-auth";

export const taskRouter = Router();

taskRouter.use(requireAuth);

taskRouter.get("/tasks", (req, res, next) => {
  listTasksController(req, res).catch(next);
});

taskRouter.post("/tasks", (req, res, next) => {
  createTaskController(req, res).catch(next);
});

taskRouter.patch("/tasks/:id", (req, res, next) => {
  updateTaskController(req, res).catch(next);
});

taskRouter.delete("/tasks/:id", (req, res, next) => {
  deleteTaskController(req, res).catch(next);
});

taskRouter.post("/tasks/:id/dependencies", (req, res, next) => {
  addDependencyController(req, res).catch(next);
});

taskRouter.delete("/tasks/:id/dependencies/:dependsOnId", (req, res, next) => {
  removeDependencyController(req, res).catch(next);
});
