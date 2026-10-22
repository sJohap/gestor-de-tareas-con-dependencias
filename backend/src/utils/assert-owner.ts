import { HttpError } from "./http-error";

export function assertOwner(actorId: string, ownerId: string): void {
  if (actorId !== ownerId) {
    throw new HttpError(403, "No tienes permiso sobre este recurso");
  }
}
