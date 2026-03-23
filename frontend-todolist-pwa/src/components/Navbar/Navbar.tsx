import { NavLink } from "react-router-dom";
import { useFriends } from "../../hooks/useFriends";
// import ThemeSelector from "../Theme/ThemeSelector";
import "./Navbar.css";

export default function Navbar() {
  const { pendingReceived } = useFriends()
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

        <NavLink to="/friends" style={{ position: 'relative' }}>
          <span className="nav-text">Amis</span>
          {pendingReceived.length > 0 && (
            <span className="nav-badge">{pendingReceived.length}</span>
          )}
        </NavLink>
       
      </div>

      {/* <div className="nav-actions">
        <ThemeSelector></ThemeSelector>
      </div> */}
    </nav>
  );
}