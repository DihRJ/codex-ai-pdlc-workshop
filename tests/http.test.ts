import { test } from "node:test";
import assert from "node:assert/strict";
import { handlers } from "../src/server/http";
import { sample, temporaryStore } from "./helpers";

test("a API exige perfil conhecido, valida entrada e aplica regras no servidor", async () => {
  const { store, cleanup } = await temporaryStore();
  const api = handlers(store);
  const request = (
    data: unknown,
    actor = "ana",
    origin = "http://localhost:3000",
  ) =>
    new Request("http://localhost:3000/api/demands", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-demo-user": actor,
        origin,
      },
      body: JSON.stringify(data),
    });
  try {
    assert.equal(
      (
        await api.POST(
          request({ type: "create", input: sample }, "inexistente"),
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await api.POST(
          request({ type: "create", input: { ...sample, amountCents: -1 } }),
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await api.POST(
          request(
            { type: "create", input: sample },
            "ana",
            "http://outro-site.test",
          ),
        )
      ).status,
      403,
    );
    const created = await api.POST(request({ type: "create", input: sample }));
    assert.equal(created.status, 201);
    const { demand } = await created.json();
    assert.equal(
      (
        await api.POST(
          request(
            { type: "advance", id: demand.id, version: demand.version },
            "bruno",
          ),
        )
      ).status,
      403,
    );
    const data = await (await api.GET()).json();
    assert.equal(data.demands.length, 9);
  } finally {
    await cleanup();
  }
});
