import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { criticalPath } from "./cpm";
import { wouldCreateCycle } from "./dependency-graph";
import { kahnOrder } from "./kahn";
import { executionState } from "./task-readiness";

describe("grafo de dependencias", () => {
  const edges = [
    { taskId: "a", dependsOnId: "b" },
    { taskId: "b", dependsOnId: "c" },
  ];

  it("permite una dependencia que no cierra un ciclo", () => {
    assert.equal(wouldCreateCycle(edges, "a", "c"), false);
  });

  it("rechaza el ciclo directo y el ciclo largo", () => {
    assert.equal(wouldCreateCycle(edges, "c", "a"), true);
    assert.equal(wouldCreateCycle(edges, "a", "a"), true);
  });
});

describe("orden de Kahn", () => {
  it("pone primero las tareas que no dependen de nadie", () => {
    const result = kahnOrder(["a", "b", "c"], [
      { taskId: "a", dependsOnId: "b" },
      { taskId: "b", dependsOnId: "c" },
    ]);

    assert.deepEqual(result.order, ["c", "b", "a"]);
    assert.equal(result.hasCycle, false);
  });

  it("avisa cuando el grafo tiene un ciclo", () => {
    const result = kahnOrder(["a", "b"], [
      { taskId: "a", dependsOnId: "b" },
      { taskId: "b", dependsOnId: "a" },
    ]);

    assert.equal(result.hasCycle, true);
  });
});

describe("camino crítico", () => {
  const tasks = [
    { id: "a", durationDays: 3, dependsOnIds: [] },
    { id: "b", durationDays: 2, dependsOnIds: ["a"] },
    { id: "c", durationDays: 4, dependsOnIds: ["a"] },
    { id: "d", durationDays: 1, dependsOnIds: ["b", "c"] },
  ];

  it("marca el camino más largo y calcula la holgura", () => {
    const result = criticalPath(tasks, ["a", "b", "c", "d"]);

    assert.ok(result);
    assert.equal(result.projectDays, 8);
    assert.equal(result.schedule.get("a")?.critical, true);
    assert.equal(result.schedule.get("c")?.critical, true);
    assert.equal(result.schedule.get("d")?.critical, true);
    assert.equal(result.schedule.get("b")?.slack, 2);
    assert.equal(result.schedule.get("b")?.critical, false);
  });

  it("no calcula el camino si el orden está incompleto", () => {
    assert.equal(criticalPath(tasks, ["a", "b"]), null);
  });
});

describe("tareas listas y bloqueadas", () => {
  it("está lista cuando todas sus dependencias terminaron", () => {
    assert.equal(executionState("pending", []), "ready");
    assert.equal(executionState("pending", ["done"]), "ready");
    assert.equal(executionState("pending", ["done", "pending"]), "blocked");
    assert.equal(executionState("done", ["pending"]), "done");
  });
});
