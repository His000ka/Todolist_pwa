export type Plant = {
  id: string;
  name: string;
  growth: number;
  level: number;
  xp: number;
  skin: "default" | "gold" | "neon";
};

export type WeatherType = "sunny" | "rain" | "night" | "golden";

export type Garden = {
  plants: Plant[];
  xp: number;
  level: number;
  weather: WeatherType;
  lastSeen: string;
};