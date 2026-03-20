import React, { createContext, useContext, useState, useEffect } from "react";

export const themes = {
  sunset: { name: "🌅", class: "theme-sunset", color: "#2d1b4e" },
  ocean: { name: "🌊", class: "theme-ocean", color: "#1a2a6c" },
  emerald: { name: "🍃", class: "theme-emerald", color: "#064e3b" },
};

type ThemeKey = keyof typeof themes;

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeKey>(() => {
    return (localStorage.getItem("app_theme") as ThemeKey) || "sunset";
  });

  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    const current = themes[theme];
    document.documentElement.className = current.class;
    
    // Fix pour la barre de statut iPhone
    const meta = document.querySelector("meta[name='theme-color']");
    if (meta) meta.setAttribute("content", current.color);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`app-wrapper ${themes[theme].class}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// Hook personnalisé pour utiliser le thème facilement
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};