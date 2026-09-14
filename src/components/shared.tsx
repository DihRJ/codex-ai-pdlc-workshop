import { Circle, CircleCheck, CircleDot } from "lucide-react";
import type { Demand } from "../domain/model";

export function Avatar({ name }: { name: string }) {
  return (
    <span className="avatar" aria-hidden="true">
      {name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
export function StatusBadge({ status }: { status: Demand["status"] }) {
  const Icon =
    status === "Nova"
      ? Circle
      : status === "Em andamento"
        ? CircleDot
        : CircleCheck;
  return (
    <span
      className={`badge ${status === "Nova" ? "new" : status === "Em andamento" ? "active" : "done"}`}
    >
      <Icon size={13} aria-hidden="true" />
      {status}
    </span>
  );
}
export function Priority({ value }: { value: Demand["priority"] }) {
  return (
    <span
      className={`priority ${value === "Alta" ? "high" : value === "Média" ? "medium" : "low"}`}
    >
      <span aria-hidden="true" />
      {value}
    </span>
  );
}
