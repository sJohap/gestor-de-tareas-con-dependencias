CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  depends_on_id UUID NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_dependencies_pair_key UNIQUE (task_id, depends_on_id),
  CONSTRAINT task_dependencies_no_self CHECK (task_id <> depends_on_id)
);

CREATE INDEX task_dependencies_task_id_idx ON task_dependencies (task_id);
CREATE INDEX task_dependencies_depends_on_idx ON task_dependencies (depends_on_id);
