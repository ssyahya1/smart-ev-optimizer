import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedOut, setLoggedOut] = useState(false);

  const checkAuth = async () => {
    try {
      const data = await apiRequest("/api/auth/me");

      setUser(data.user || data);
      setLoggedOut(false);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleSessionExpired = () => {
      setUser(null);
      setLoggedOut(false);
    };

    window.addEventListener("auth:expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:expired", handleSessionExpired);
    };
  }, []);

  const login = async (email, password) => {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    setLoggedOut(false);
    setUser(data.user || data);

    return data;
  };

  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setLoggedOut(true);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    isAuthenticated: Boolean(user),
    loggedOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}