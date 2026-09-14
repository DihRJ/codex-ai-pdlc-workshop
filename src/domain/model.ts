import { z } from "zod";

export const areas = ["Engenharia", "Design", "Operações", "Produto"] as const;
export const priorities = ["Alta", "Média", "Baixa"] as const;
export const statuses = ["Nova", "Em andamento", "Concluída"] as const;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["solicitante", "gestor"]),
});
export const inputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Informe um título com pelo menos 3 caracteres.")
      .max(120),
    description: z.string().trim().max(2000),
    area: z.enum(areas),
    priority: z.enum(priorities),
    amountCents: z
      .number()
      .int()
      .positive("O valor deve ser maior que zero.")
      .max(100_000_000),
  })
  .strict();
export const eventSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  actorName: z.string(),
  at: z.iso.datetime(),
  kind: z.enum(["created", "updated", "started", "completed"]),
  message: z.string(),
});
export const demandSchema = inputSchema.extend({
  id: z.string(),
  requesterId: z.string(),
  status: z.enum(statuses),
  version: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  history: z.array(eventSchema).min(1),
});
export const databaseSchema = z.object({
  schemaVersion: z.literal(1),
  nextId: z.number().int().positive(),
  users: z.array(userSchema).min(1),
  demands: z.array(demandSchema),
});
const target = { id: z.string().min(1), version: z.number().int().positive() };
export const commandSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("create"), input: inputSchema }).strict(),
  z
    .object({ type: z.literal("update"), ...target, input: inputSchema })
    .strict(),
  z.object({ type: z.literal("advance"), ...target }).strict(),
]);

export type User = z.infer<typeof userSchema>;
export type DemandInput = z.infer<typeof inputSchema>;
export type Demand = z.infer<typeof demandSchema>;
export type Database = z.infer<typeof databaseSchema>;
export type Command = z.infer<typeof commandSchema>;
export type HistoryEvent = z.infer<typeof eventSchema>;

export class DomainError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
