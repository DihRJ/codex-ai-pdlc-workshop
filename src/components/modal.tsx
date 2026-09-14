"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({
  label,
  onClose,
  children,
  busy = false,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current && !busy) onClose();
      }}
    >
      <button
        className="icon-button close-dialog"
        aria-label="Fechar janela"
        disabled={busy}
        onClick={onClose}
      >
        <X size={20} />
      </button>
      {children}
    </dialog>
  );
}
