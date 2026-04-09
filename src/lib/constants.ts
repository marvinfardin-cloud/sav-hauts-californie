export const SHOP_NAME = "Les Hauts de Californie";
export const SHOP_ADDRESS = "97232 Le Lamentin";
export const SHOP_PHONE = "05.96.42.75.00";
export const SHOP_EMAIL = "zingzag10@hotmail.fr";

export const STATUT_CONFIG = {
  RECU: { label: "Reçu", color: "bg-gray-100 text-gray-700", dotColor: "bg-gray-400" },
  DIAGNOSTIC: { label: "En diagnostic", color: "bg-blue-100 text-blue-700", dotColor: "bg-blue-500" },
  ATTENTE_PIECES: { label: "Attente pièces", color: "bg-orange-100 text-orange-700", dotColor: "bg-orange-500" },
  EN_REPARATION: { label: "En réparation", color: "bg-yellow-100 text-yellow-700", dotColor: "bg-yellow-500" },
  PRET: { label: "Prêt", color: "bg-green-100 text-green-700", dotColor: "bg-green-500" },
  LIVRE: { label: "Livré", color: "bg-gray-50 text-gray-400", dotColor: "bg-gray-300" },
} as const;

export type StatutKey = keyof typeof STATUT_CONFIG;

// SAV working hours
export const SAV_HOURS = {
  // [dayOfWeek]: [[startHour, endHour], ...]
  1: [[7, 12], [13, 16]], // Monday
  2: [[7, 12], [13, 16]], // Tuesday
  3: [[7, 12], [13, 16]], // Wednesday
  4: [[7, 12], [13, 16]], // Thursday
  5: [[7, 12], [13, 15]], // Friday
  // No SAV on Saturday (6) and Sunday (0)
} as Record<number, [number, number][]>;

export const SHOP_HOURS_TEXT = {
  magasin: "Lundi au vendredi : 7h-16h | Samedi : 8h-12h",
  sav: "Lun-Jeu : 7h-12h / 13h-16h | Ven : 7h-12h / 13h-15h",
};

export const RDV_TYPES = [
  { value: "depot", label: "Dépôt matériel" },
  { value: "retrait", label: "Retrait" },
  { value: "diagnostic", label: "Diagnostic" },
];
