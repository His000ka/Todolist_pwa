import "./XPBar.css";

type Props = {
  xp: number;
  level: number;
  totalXP: number;
  streak: number;
  tasksDone: number;
  xpPerLevel: number;
};

export default function XPBar({ xp, level, totalXP, streak, tasksDone, xpPerLevel }: Props) {
  const percent = Math.round((xp / xpPerLevel) * 100);

  return (
    <div className="xpbar-wrapper">

      <div className="xpbar-header">
        <div className="xpbar-level-block">
          <span className="xpbar-label">Niveau</span>
          <span className="xpbar-level">{level}</span>
        </div>
        <div className="xpbar-xp-count">{xp} / {xpPerLevel} xp</div>
      </div>

      <div className="xpbar-track">
        <div className="xpbar-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="xpbar-stats">
        <div className="xpbar-stat">
          <span className="xpbar-stat-value xpbar-streak">{streak}</span>
          <span className="xpbar-stat-label">jours</span>
        </div>
        <div className="xpbar-stat">
          <span className="xpbar-stat-value xpbar-total">{totalXP}</span>
          <span className="xpbar-stat-label">xp total</span>
        </div>
        <div className="xpbar-stat">
          <span className="xpbar-stat-value xpbar-tasks">{tasksDone}</span>
          <span className="xpbar-stat-label">tâches</span>
        </div>
      </div>

    </div>
  );
}
