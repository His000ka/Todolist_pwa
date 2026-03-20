import { useEffect, useState } from "react";
import type { Garden, Plant } from "./types";
import { XP_PER_LEVEL, XP_REWARDS } from "./constants";

const today = () => new Date().toISOString().slice(0, 10);

const defaultGarden: Garden = {
  plants:    [],
  xp:        0,
  level:     1,
  weather:   "sunny",
  lastSeen:  today(),
};

export const useGame = () => {
  const [garden, setGarden] = useState<Garden>(() => {
    const stored = localStorage.getItem("garden");
    return stored ? JSON.parse(stored) : defaultGarden;
  });

  // stats dérivées — pas besoin de les stocker
  const [totalXP, setTotalXP] = useState<number>(() => {
    const stored = localStorage.getItem("garden_totalXP");
    return stored ? Number(stored) : 0;
  });

  useEffect(() => {
    localStorage.setItem("garden", JSON.stringify(garden));
  }, [garden]);

  useEffect(() => {
    localStorage.setItem("garden_totalXP", String(totalXP));
  }, [totalXP]);

  const addXP = (amount: number, hasStreakBonus = false) => {
    const finalAmount = hasStreakBonus
      ? Math.round(amount * XP_REWARDS.streakBonus)
      : amount;

    setTotalXP(prev => prev + finalAmount);
    setGarden(prev => {
      let xp    = prev.xp + finalAmount;
      let level = prev.level;
      while (xp >= XP_PER_LEVEL) { xp -= XP_PER_LEVEL; level++; }
      return { ...prev, xp, level };
    });
  };

  const addPlant = (plant: Plant) => {
    setGarden(prev => ({ ...prev, plants: [...prev.plants, plant] }));
  };

  const setWeather = (weather: Garden["weather"]) => {
    setGarden(prev => ({ ...prev, weather }));
  };

  const updateLastSeen = () => {
    setGarden(prev => ({ ...prev, lastSeen: today() }));
  };

  return {
    garden,
    totalXP,
    addPlant,
    addXP,
    setWeather,
    updateLastSeen,
  };
};
