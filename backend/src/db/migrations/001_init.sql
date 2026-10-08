CREATE TABLE app_meta (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  app_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT app_meta_singleton CHECK (id = 1)
);

INSERT INTO app_meta (id, app_name)
VALUES (1, 'Gestor de tareas con dependencias');
