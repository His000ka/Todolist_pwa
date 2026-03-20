import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar/Navbar";
import ListeCourse from "./pages/ListeCourse";
import "./App.css";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
      <div className="bg-animation">
        <div className="orbe orbe-1"></div>
        <div className="orbe orbe-2"></div>
      </div>

        <Navbar />
      <div className="app-container">
        
        <main>
            <Routes>
              <Route path="/todo" element={<ListeCourse />} />
              {/* <Route path="/stats" element={<Stats />} /> */}
              
              <Route path="/" element={<ListeCourse />} />
            </Routes>
        </main>
      </div>
      </Router>
    </ThemeProvider>
  );
}