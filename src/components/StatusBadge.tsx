"use client";

import { STATUT_CONFIG, StatutKey } from "@/lib/constants";

export default function StatusBadge({ statut }: { statut: string }) {
  const config = STATUT_CONFIG[statut as StatutKey];
  if (!config) return <span>{statut}</span>;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
