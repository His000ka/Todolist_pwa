import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar/Navbar";
import ListCourse from "./pages/ListeCourse";
import "./App.css";

export default function App() {
  return (
    <ThemeProvider>
      {/* Background vivant (commun à toutes les pages) */}
      <Router>
      <div className="bg-animation">
        <div className="orbe orbe-1"></div>
        <div className="orbe orbe-2"></div>
      </div>

        <Navbar />
      <div className="app-container">
        {/* La Navbar reste toujours visible en haut */}
        
        <main>
          {/* Le Router gère quelle page afficher à l'intérieur du main */}
            <Routes>
              <Route path="/todo" element={<ListCourse />} />
              {/* Plus tard, tu ajouteras d'autres routes ici, ex: */}
              {/* <Route path="/stats" element={<Stats />} /> */}
              
              <Route path="/" element={<ListCourse />} />
            </Routes>
        </main>
      </div>
      </Router>
    </ThemeProvider>
  );
}