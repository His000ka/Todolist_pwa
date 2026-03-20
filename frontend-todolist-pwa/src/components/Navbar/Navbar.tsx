import { NavLink } from "react-router-dom";
import ThemeSelector from "../Theme/ThemeSelector";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="bottom-navbar">
      <div className="nav-links">
        {/* Lien vers la Todo */}
        <NavLink 
          to="/todo" 
        //   className={({ isActive } : {isActive: boolean}) => isActive ? "nav-item active" : "nav-item"}
        >
          <span className="nav-text">Tâches</span>
        </NavLink>

        {/* Lien vers tes futures Stats (tu pourras le décommenter plus tard) */}
        <NavLink
            to="/premium"
        >
            <span className="nav-text">Todo</span>
        </NavLink>
        <NavLink 
          to="/stats" 
        //   className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <span className="nav-text">Stats</span>
        </NavLink>
        <NavLink
            to="/garden"
        >
            <span className="nav-text">Gaden</span>
        </NavLink>
       
      </div>

      <div className="nav-actions">
        <ThemeSelector />
      </div>
    </nav>
  );
}