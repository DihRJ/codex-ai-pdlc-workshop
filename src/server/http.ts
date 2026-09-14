import { ZodError } from "zod";
import { applyCommand } from "../domain/demands";
import { commandSchema, DomainError } from "../domain/model";
import { JsonStore, StoreError } from "./json-store";

export function handlers(store: JsonStore) {
  function failure(error: unknown) {
    if (error instanceof DomainError)
      return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof ZodError)
      return Response.json(
        {
          error: error.issues
            .slice(0, 3)
            .map((issue) => issue.message)
            .join(" "),
        },
        { status: 400 },
      );
    if (error instanceof StoreError)
      return Response.json({ error: error.message }, { status: 503 });
    console.error("Falha no armazenamento de demandas:", error);
    return Response.json(
      {
        error:
          "Não foi possível acessar os dados. Consulte o terminal do servidor.",
      },
      { status: 500 },
    );
  }
  return {
    async GET() {
      try {
        return Response.json(await store.read(), {
          headers: { "Cache-Control": "no-store" },
        });
      } catch (error) {
        return failure(error);
      }
    },
    async POST(request: Request) {
      try {
        const origin = request.headers.get("origin");
        // Next.js can normalize request.url to localhost; Host retains the browser's address.
        const host = request.headers.get("host") || new URL(request.url).host;
        if (origin && new URL(origin).host !== host)
          throw new DomainError("Origem da solicitação não permitida.", 403);
        if (
          !request.headers.get("content-type")?.startsWith("application/json")
        )
          throw new DomainError("Envie os dados como JSON.", 415);
        const text = await request.text();
        if (text.length > 20_000)
          throw new DomainError("Solicitação muito grande.", 413);
        let data: unknown;
        try {
          data = JSON.parse(text);
        } catch {
          throw new DomainError("JSON inválido.");
        }
        const command = commandSchema.parse(data);
        const actorId = request.headers.get("x-demo-user") || "";
        const demand = await store.update((db) =>
          applyCommand(db, actorId, command),
        );
        return Response.json(
          { demand },
          { status: command.type === "create" ? 201 : 200 },
        );
      } catch (error) {
        return failure(error);
      }
    },
  };
}
