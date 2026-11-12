ALTER TABLE tasks
  ADD COLUMN duration_days INTEGER NOT NULL DEFAULT 1;

ALTER TABLE tasks
  ADD CONSTRAINT tasks_duration_check CHECK (duration_days BETWEEN 1 AND 365);
