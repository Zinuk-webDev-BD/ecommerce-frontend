"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  // true while we check if a saved token is still valid
  const [loading, setLoading] = useState(true);

  // when the site opens, check the saved token
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (!saved) {
      setLoading(false);
      return;
    }

    api("/auth/me", { token: saved })
      .then((data) => {
        setToken(saved);
        setUser(data.user);
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  // login and keep the token
  const login = async (email, password) => {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    localStorage.setItem("token", data.token);

    // get the full user info (with role)
    const me = await api("/auth/me", { token: data.token });
    setToken(data.token);
    setUser(me.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);