import React, { createContext, useContext, useEffect } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  forcedTheme?: string;
  attribute?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  forcedTheme = "dark",
}: ThemeProviderProps) {
  useEffect(() => {
    // Ensure dark class is always present on document root
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: forcedTheme || defaultTheme, setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;
