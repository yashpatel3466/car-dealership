import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { AuthAPI, setTokens } from "../api/client";

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username, role }
  const [error, setError] = useState(null);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const data = await AuthAPI.login({ username, password });
      setTokens({ access: data.access, refresh: data.refresh });
      const claims = decodeJwt(data.access);
      setUser({ username: claims?.username ?? username, role: claims?.role ?? "customer" });
      return true;
    } catch (err) {
      setError(err.data?.detail ?? "Invalid username or password.");
      return false;
    }
  }, []);

  const register = useCallback(
    async (username, email, password) => {
      setError(null);
      try {
        await AuthAPI.register({ username, email, password });
        return login(username, password);
      } catch (err) {
        setError(err.data?.username?.[0] ?? err.data?.password?.[0] ?? "Registration failed.");
        return false;
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    setTokens({ access: null, refresh: null });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === "admin", login, register, logout, error }),
    [user, login, register, logout, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
