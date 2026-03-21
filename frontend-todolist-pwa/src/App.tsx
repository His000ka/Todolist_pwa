import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar/Navbar";
import ListeCourse from "./pages/ListeCourse";
import Stat from './pages/StatPage';
import TodoPremium from './pages/TodoPremium';
import Garden from './pages/Garden/Garden';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/Auth/AuthPage';
import ProfilePage from './pages/Profile/ProfilePage';
// import { useAuth } from './context/AuthContext'

export default function App() {
    // const { user, loading } = useAuth()

    // if (loading) return null
    // if (!user) return <AuthPage />


  return (
    <ThemeProvider>
      <AuthProvider>
      <Router>
      <div className="bg-animation">
        <div className="orbe orbe-1"></div>
        <div className="orbe orbe-2"></div>
      </div>

      <div className="app-wrapper">
        <div className="app-container"> 
            <main>
                <Routes>
                    <Route path="/profile" element={<ProfilePage />} />
                <Route path="/todo" element={<ListeCourse />} />
                <Route path="/stats" element={<Stat />} />
                <Route path='/premium' element={<TodoPremium/>} />
                <Route path="/garden" element={<Garden />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<ListeCourse />} />
                </Routes>
            </main>
        </div>
      </div>
      <Navbar />
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}