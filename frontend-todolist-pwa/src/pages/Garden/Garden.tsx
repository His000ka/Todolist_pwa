import { useEffect, useRef } from "react";
import { useGame } from "../../game/useGame";
import { WEATHER_BACKGROUNDS, XP_PER_LEVEL } from "../../game/constants";
import PlantSVG from "./components/PlantSVG";
import XPBar from "./components/XPBar";
import type { Garden as GardenType } from "../../game/types";
import "./Garden.css";

const WEATHER_OPTIONS: { key: GardenType["weather"]; label: string }[] = [
  { key: "sunny",  label: "Soleil" },
  { key: "rain",   label: "Pluie"  },
  { key: "night",  label: "Nuit"   },
];

// --- Météo : particules pluie ---
function RainOverlay() {
  return (
    <div className="weather-rain" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="rain-drop" style={{
          left:             `${(i * 8.3) % 100}%`,
          animationDelay:   `${(i * 0.13) % 1}s`,
          animationDuration:`${0.7 + (i % 3) * 0.15}s`,
        }}/>
      ))}
    </div>
  );
}

// --- Météo : étoiles nuit ---
function StarsOverlay() {
  return (
    <div className="weather-stars" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="star" style={{
          left:           `${(i * 5.7 + 3) % 95}%`,
          top:            `${(i * 7.3 + 5) % 60}%`,
          animationDelay: `${(i * 0.3) % 2}s`,
          width:          i % 3 === 0 ? "2px" : "1.5px",
          height:         i % 3 === 0 ? "2px" : "1.5px",
        }}/>
      ))}
    </div>
  );
}

export default function Garden() {
  const { garden, totalXP, addXP, setWeather } = useGame();
  const bgRef = useRef<HTMLDivElement>(null);

  // Met à jour le fond selon la météo
  useEffect(() => {
    if (bgRef.current) {
      bgRef.current.style.background = WEATHER_BACKGROUNDS[garden.weather];
    }
  }, [garden.weather]);

  // Stats factices pour le streak — sera branché sur usePremiumTasks en Phase 3
  const streak = 7;

  return (
    <div className="garden-page">

      {/* Fond météo */}
      <div ref={bgRef} className="garden-weather-bg" />

      {/* Overlay météo animé */}
      {garden.weather === "rain"  && <RainOverlay />}
      {garden.weather === "night" && <StarsOverlay />}

      {/* Card principale */}
      <div className="garden-card">

        {/* Header */}
        <div className="garden-header">
          <div>
            <p className="garden-subtitle">Focus Garden</p>
            <h2 className="garden-title">Mon jardin zen</h2>
          </div>
          <div className="weather-selector">
            {WEATHER_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setWeather(key)}
                className={`weather-btn weather-btn--${key} ${garden.weather === key ? "active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Plante */}
        <div className="garden-plant-area">
          <PlantSVG level={garden.level} />
        </div>

        {/* XP + stats */}
        <XPBar
          xp={garden.xp}
          level={garden.level}
          totalXP={totalXP}
          streak={streak}
          tasksDone={0}
          xpPerLevel={XP_PER_LEVEL}
        />

        {/* Boutons test — sera retiré quand branché sur la todolist */}
        <div className="garden-actions">
          <button className="garden-btn garden-btn--task"
            onClick={() => addXP(15)}>
            + Tâche <span>15 xp</span>
          </button>
          <button className="garden-btn garden-btn--daily"
            onClick={() => addXP(40, true)}>
            + Daily <span>40 xp</span>
          </button>
        </div>

      </div>
    </div>
  );
}