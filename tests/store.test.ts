import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { applyCommand } from "../src/domain/demands";
import { JsonStore } from "../src/server/json-store";
import { sample, temporaryStore } from "./helpers";

test("mutações concorrentes não perdem demandas, inclusive usando duas instâncias", async () => {
  const { store, cleanup } = await temporaryStore();
  try {
    const initial = await store.read();
    const other = new JsonStore(store.file);
    await Promise.all(
      Array.from({ length: 12 }, (_, index) =>
        (index % 2 ? store : other).update((db) =>
          applyCommand(db, "ana", {
            type: "create",
            input: { ...sample, title: `Solicitação ${index}` },
          }),
        ),
      ),
    );
    const persisted = await new JsonStore(store.file).read();
    assert.equal(persisted.demands.length, initial.demands.length + 12);
    assert.equal(
      new Set(persisted.demands.map((demand) => demand.id)).size,
      persisted.demands.length,
    );
  } finally {
    await cleanup();
  }
});

test("uma alteração inválida preserva o arquivo anterior", async () => {
  const { store, cleanup } = await temporaryStore();
  try {
    await store.read();
    const original = await readFile(store.file, "utf8");
    await assert.rejects(
      store.update((db) => {
        db.demands[0].amountCents = -1;
      }),
    );
    assert.equal(await readFile(store.file, "utf8"), original);
  } finally {
    await cleanup();
  }
});

test("JSON corrompido não é substituído silenciosamente; reset preserva backup", async () => {
  const { store, cleanup } = await temporaryStore();
  try {
    await store.read();
    await writeFile(store.file, "{interrompido");
    await assert.rejects(store.read(), /inválido/);
    assert.equal(await readFile(store.file, "utf8"), "{interrompido");
    const backup = await store.reset();
    assert.ok(backup);
    assert.equal(await readFile(backup, "utf8"), "{interrompido");
    assert.equal((await store.read()).demands.length, 8);
  } finally {
    await cleanup();
  }
});
