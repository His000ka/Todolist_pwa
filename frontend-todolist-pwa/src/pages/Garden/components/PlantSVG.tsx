import "./PlantSVG.css";

type Props = { level: number };

const getStage = (level: number) => {
  if (level >= 10) return "zen";
  if (level >= 6)  return "plant";
  if (level >= 3)  return "sprout";
  return "seed";
};

function SeedSVG() {
  return (
    <svg width="120" height="160" viewBox="0 0 80 110">
      <ellipse cx="40" cy="100" rx="30" ry="6" fill="rgba(80,50,30,0.4)"/>
      <path d="M38 100 C38 100 36 90 35 80"
        stroke="#5a3e2b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="35" cy="75" rx="8" ry="5"
        fill="#4a7c4e" transform="rotate(-20,35,75)"/>
      <ellipse cx="44" cy="72" rx="7" ry="4"
        fill="#5a9a5e" transform="rotate(15,44,72)"/>
    </svg>
  );
}

function SproutSVG() {
  return (
    <svg width="120" height="160" viewBox="0 0 80 110" overflow="visible">
      <ellipse cx="40" cy="100" rx="30" ry="6" fill="rgba(80,50,30,0.4)"/>
      <g className="plant-sway">
        <path d="M40 100 C40 100 39 80 38 60 C37 45 39 35 40 25"
          stroke="#4a7c4e" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M39 65 C32 58 28 50 30 42 C32 34 38 33 42 38"
          fill="#3a8a48" opacity={0.9}/>
        <path d="M39 65 C33 60 30 52 30 42"
          stroke="#2d6e3a" strokeWidth="0.8" fill="none"/>
        <path d="M39 50 C46 44 52 46 52 54 C52 62 46 64 41 60"
          fill="#4aaa58" opacity={0.85}/>
        <path d="M39 50 C45 52 50 56 52 54"
          stroke="#3a8a48" strokeWidth="0.8" fill="none"/>
        <ellipse cx="40" cy="18" rx="10" ry="7" fill="#5abf6a" opacity={0.9}/>
      </g>
    </svg>
  );
}

function PlantSVG_() {
  return (
    <svg width="120" height="160" viewBox="0 0 80 110" overflow="visible">
      <ellipse cx="40" cy="102" rx="32" ry="6" fill="rgba(80,50,30,0.4)"/>
      <g className="plant-sway-slow">
        <path d="M40 102 C40 102 38 75 37 50 C36 30 39 18 40 8"
          stroke="#4a7c4e" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M37 80 C25 72 20 58 24 46 C28 35 36 34 40 42"
          fill="#3a8a48" opacity={0.85}/>
        <path d="M37 60 C48 52 56 54 56 65 C56 76 48 78 41 72"
          fill="#45aa55" opacity={0.85}/>
        <path d="M38 40 C28 32 26 20 32 14 C36 10 40 12 40 20"
          fill="#3a8a48" opacity={0.8}/>
        <path d="M40 30 C50 22 58 24 56 34 C54 42 47 44 41 38"
          fill="#50bb62" opacity={0.8}/>
        <ellipse cx="40" cy="5" rx="8" ry="6" fill="#65cc78" opacity={0.9}/>
      </g>
      <circle className="plant-particle p1" cx="55" cy="50" r="2"
        fill="rgba(100,220,120,0.6)"/>
      <circle className="plant-particle p2" cx="22" cy="40" r="1.5"
        fill="rgba(120,240,140,0.5)"/>
      <circle className="plant-particle p3" cx="60" cy="70" r="2"
        fill="rgba(80,200,100,0.5)"/>
    </svg>
  );
}

function ZenTreeSVG() {
  return (
    <svg width="140" height="180" viewBox="0 0 80 110" overflow="visible">
      <ellipse cx="40" cy="104" rx="32" ry="6" fill="rgba(80,50,30,0.4)"/>
      <g className="plant-sway">
        <path d="M40 104 C40 104 40 80 40 55 C40 35 40 20 40 8"
          stroke="#5a4a2a" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M40 90 C24 85 16 70 20 56 C24 44 34 42 38 52"
          fill="#3a8a48" opacity={0.8}/>
        <path d="M40 90 C56 84 64 70 60 56 C56 44 46 42 42 52"
          fill="#45aa55" opacity={0.8}/>
        <path d="M40 65 C22 60 14 44 20 30 C24 20 34 18 38 28"
          fill="#3a8a48" opacity={0.75}/>
        <path d="M40 65 C58 58 66 44 60 30 C56 20 46 18 42 28"
          fill="#50bb62" opacity={0.75}/>
        <path d="M40 40 C28 36 22 24 28 14 C32 8 38 8 40 16"
          fill="#3a8a48" opacity={0.7}/>
        <path d="M40 40 C52 34 58 22 52 12 C48 6 42 6 40 14"
          fill="#5ac86e" opacity={0.7}/>
        <circle cx="40" cy="5" r="6" fill="#70d880" opacity={0.9}/>
      </g>
      <circle className="plant-particle p1" cx="62" cy="55" r="2"
        fill="rgba(180,255,160,0.6)"/>
      <circle className="plant-particle p2" cx="18" cy="45" r="1.5"
        fill="rgba(160,255,140,0.5)"/>
      <circle className="plant-particle p3" cx="65" cy="78" r="2"
        fill="rgba(140,240,120,0.5)"/>
    </svg>
  );
}

const STAGE_COMPONENTS = {
  seed:   <SeedSVG />,
  sprout: <SproutSVG />,
  plant:  <PlantSVG_ />,
  zen:    <ZenTreeSVG />,
};

export default function PlantSVG({ level }: Props) {
  const stage = getStage(level);
  return (
    <div className="plant-container">
      {STAGE_COMPONENTS[stage]}
    </div>
  );
}