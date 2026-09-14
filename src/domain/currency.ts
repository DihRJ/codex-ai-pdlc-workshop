export function parseAmount(value: string): number {
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(value.trim());
  if (!match)
    throw new Error("Use um valor como 1200,00, sem separador de milhares.");
  const cents =
    Number(match[1]) * 100 + Number((match[2] || "").padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 100_000_000) {
    throw new Error("Informe um valor entre R$ 0,01 e R$ 1.000.000,00.");
  }
  return cents;
}
export const formatAmount = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
