"use client";

const STEPS = [
  { key: "RECU", label: "Dépôt" },
  { key: "DIAGNOSTIC", label: "Diagnostic" },
  { key: "EN_REPARATION", label: "Réparation" },
  { key: "PRET", label: "Prêt" },
  { key: "LIVRE", label: "Livré" },
];

export default function ProgressBar({ statut }: { statut: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === statut);
  // ATTENTE_PIECES maps to the same visual position as DIAGNOSTIC
  const activeIndex =
    statut === "ATTENTE_PIECES" ? 1 : currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {STEPS.map((step, i) => {
          const isDone = i < activeIndex;
          const isCurrent = i === activeIndex;
          const isPending = i > activeIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative">
              {/* Connector line */}
              {i > 0 && (
                <div
                  className={`absolute top-3 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                    isDone || isCurrent ? "bg-blue-800" : "bg-gray-200"
                  }`}
                  style={{ zIndex: 0 }}
                />
              )}
              {/* Dot */}
              <div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDone
                    ? "bg-blue-800 text-white"
                    : isCurrent
                    ? "bg-blue-800 text-white ring-4 ring-blue-100"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isDone ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              {/* Label */}
              <span
                className={`mt-1.5 text-[10px] sm:text-xs font-medium text-center leading-tight ${
                  isDone || isCurrent ? "text-blue-800" : "text-gray-400"
                } ${isPending ? "" : ""}`}
              >
                {step.label}
              </span>
              {/* Extra label for ATTENTE_PIECES */}
              {isCurrent && statut === "ATTENTE_PIECES" && (
                <span className="text-[9px] text-orange-600 font-medium mt-0.5">
                  (attente pièces)
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
