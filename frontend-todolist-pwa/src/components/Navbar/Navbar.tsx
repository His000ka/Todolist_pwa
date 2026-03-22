import { NavLink } from "react-router-dom";
// import ThemeSelector from "../Theme/ThemeSelector";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="bottom-navbar">
      <div className="nav-links">

        <NavLink to="/todo">
          <span className="nav-text">Tâches</span>
        </NavLink>

        {/* Lien vers tes futures Stats (tu pourras le décommenter plus tard) */}
        <NavLink to="/premium">
            <span className="nav-text">Todo</span>
        </NavLink>
        {/* <NavLink to="/stats">
          <span className="nav-text">Stats</span>
        </NavLink> */}
        <NavLink to="/garden">
            <span className="nav-text">Garden</span>
        </NavLink>

        <NavLink to="/profile">
            <span className="nav-text">Profil</span>
        </NavLink>
       
      </div>

      {/* <div className="nav-actions">
        <ThemeSelector></ThemeSelector>
      </div> */}
    </nav>
  );
}