export const XP_PER_LEVEL = 100;

export const PLANT_STAGES = [
  { minLevel: 1,  label: "graine"     },
  { minLevel: 3,  label: "pousse"     },
  { minLevel: 6,  label: "plante"     },
  { minLevel: 10, label: "arbre zen"  },
] as const;

export const WEATHER_BACKGROUNDS: Record<string, string> = {
  sunny:  "linear-gradient(160deg, rgba(255,200,80,0.07), rgba(255,160,40,0.04))",
  rain:   "linear-gradient(160deg, rgba(80,120,255,0.08), rgba(60,100,220,0.05))",
  night:  "linear-gradient(160deg, rgba(80,40,160,0.12), rgba(40,20,100,0.08))",
  golden: "linear-gradient(160deg, rgba(255,160,40,0.14), rgba(255,100,40,0.08))",
};

export const XP_REWARDS = {
  taskBase:       10,   // × importance
  dailyBase:      8,
  weeklyBase:     12,
  streakBonus:    1.2,  // multiplicateur si streak ≥ 7j
  streakThreshold: 7,
} as const;