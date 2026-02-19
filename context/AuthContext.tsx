"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { logger } from "@/services/LogService";

// --- Types ---
interface User {
  id: number;
  username: string;
  email: string;
  xp: number;
  level: number;
  gold: number;
  venue_id?: number;
  party_id?: number;
  party_name?: string;
}

interface LoginData {
  email: string;
  password?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  // New Signatures: Async functions that take form data
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = "http://localhost:3000/api/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- INTERNAL HELPER: Set State ---
  const setAuth = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // 1. LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsLoading(false);
    logger.log("👋 Logged out");
  }, []);

  // 2. LOGIN (API Call)
  const login = async ({ email, password }: LoginData) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      // Safety Check
      if (typeof data.token !== "string") {
        throw new Error("Invalid token format from server");
      }

      setAuth(data.token, data.user);
      logger.log(`✅ Welcome back, ${data.user.username}`);
    } catch (err) {
      logger.log(`❌ Login Error: ${err}`);
      throw err; // Re-throw so the Component can show the error message
    }
  };

  // 3. REGISTER (API Call)
  const register = async ({ username, email, password }: RegisterData) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Registration failed");

      if (typeof data.token !== "string") {
        throw new Error("Invalid token format from server");
      }

      setAuth(data.token, data.user);
      logger.log(`✅ Account created for ${data.user.username}`);
    } catch (err) {
      logger.log(`❌ Register Error: ${err}`);
      throw err;
    }
  };

  // 4. LOAD USER (Persist Session)
  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token");

    // Integrity Check
    if (storedToken === "[object Object]") {
      logout();
      return;
    }

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(storedToken);
      } else {
        logout();
      }
    } catch (err) {
      // Offline or server down - keep silent or handle gracefully
    } finally {
      setIsLoading(false);
    }
  }, [logout, setAuth]);

  // 5. UPDATE USER (Optimistic updates)
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Heartbeat: Update last_active every 2 minutes
  useEffect(() => {
    if (!token) return;

    const sendHeartbeat = async () => {
      try {
        await fetch("http://localhost:3000/api/users/heartbeat", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        // Silently fail if offline
      }
    };

    // Send immediately on mount/login
    sendHeartbeat();

    // Then every 2 minutes
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading,
        loadUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
