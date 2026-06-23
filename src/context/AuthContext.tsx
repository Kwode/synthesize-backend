import React, { createContext, useState, useEffect, useContext } from "react";

export type ApiMode = "sandbox" | "live";

interface AuthContextType {
  token: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  apiMode: ApiMode;
  login: (email: string, token: string) => void;
  logout: () => void;
  setApiMode: (mode: ApiMode) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("user_email"));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiMode, setApiModeState] = useState<ApiMode>(
    (localStorage.getItem("api_mode") as ApiMode) || "sandbox"
  );

  useEffect(() => {
    // Check local storage for session initial state
    const savedToken = localStorage.getItem("access_token");
    const savedEmail = localStorage.getItem("user_email");
    if (savedToken) {
      setToken(savedToken);
      setUserEmail(savedEmail);
    }
    setIsLoading(false);
  }, []);

  // Listen to the 401 unauthorized interception event from axios
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUserEmail(null);
    };
    
    window.addEventListener("auth_unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth_unauthorized", handleUnauthorized);
    };
  }, []);

  const login = (email: string, accessToken: string) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user_email", email);
    setToken(accessToken);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    setToken(null);
    setUserEmail(null);
  };

  const setApiMode = (mode: ApiMode) => {
    localStorage.setItem("api_mode", mode);
    setApiModeState(mode);
    // Reload components that depend on API calls
    window.dispatchEvent(new Event("api_mode_updated"));
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        userEmail,
        isAuthenticated,
        isLoading,
        apiMode,
        login,
        logout,
        setApiMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
