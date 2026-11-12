import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createMemoryQueue } from "./memory-queue";

describe("cola en memoria", () => {
  it("reintenta un fallo y luego lo completa", async () => {
    const queue = createMemoryQueue();
    let calls = 0;

    queue.register("work", async () => {
      calls += 1;
      if (calls === 1) {
        throw new Error("temporal");
      }
    });

    queue.enqueue("work");
    await queue.drain(Date.now() + 60_000);

    assert.equal(calls, 2);
    assert.equal(queue.pending(), 0);
    assert.equal(queue.failures().length, 0);
  });

  it("guarda el fallo cuando se acaban los intentos", async () => {
    const queue = createMemoryQueue();

    queue.register("boom", async () => {
      throw new Error("no");
    });

    queue.enqueue("boom");
    await queue.drain(Date.now() + 1_000_000);

    assert.equal(queue.pending(), 0);
    assert.equal(queue.failures().length, 1);
    assert.equal(queue.failures()[0]?.name, "boom");
  });
});
