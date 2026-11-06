import { z } from "zod";

const title = z
  .string("El título es obligatorio")
  .trim()
  .min(1, "El título es obligatorio")
  .max(120, "El título no puede tener más de 120 caracteres");

const description = z
  .string("La descripción debe ser texto")
  .trim()
  .max(500, "La descripción no puede tener más de 500 caracteres")
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null));

const taskId = z.uuid("Identificador inválido");

const durationDays = z.coerce
  .number("La duración debe ser un número")
  .int("La duración debe ser un número entero")
  .min(1, "La duración mínima es 1 día")
  .max(365, "La duración máxima es 365 días");

export const createTaskSchema = z.object({
  title,
  description,
  durationDays,
});

export const updateTaskSchema = z.object({
  title,
  description,
  status: z.enum(["pending", "in_progress", "done"], "Estado inválido"),
  durationDays,
});

export const taskParamsSchema = z.object({
  id: taskId,
});

export const dependencySchema = z.object({
  dependsOnId: taskId,
});

export const dependencyParamsSchema = z.object({
  id: taskId,
  dependsOnId: taskId,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
