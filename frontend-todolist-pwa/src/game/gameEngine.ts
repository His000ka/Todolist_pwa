import type { Garden } from "./types";

export const addXP = (garden: Garden, amount: number): Garden => {
  let xp = garden.xp + amount;
  let level = garden.level;

  // level up simple
  while (xp >= 100) {
    xp -= 100;
    level += 1;
  }

  return {
    ...garden,
    xp,
    level,
  };
};