import { createContext, useContext, useState, type ReactNode } from "react";
import { hashPassword, verifyPassword } from "./crypto.js";
import { loadUser, saveUser, isSessionActive, setSession, type StoredUser } from "./storage.js";

interface AuthContextValue {
  user: StoredUser | null;
  register: (data: { fullName: string; email: string; password: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() =>
    isSessionActive() ? loadUser() : null
  );

  const register: AuthContextValue["register"] = async ({ fullName, email, password }) => {
    const { hash, salt } = await hashPassword(password);
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      balance: 0,
    };
    saveUser(newUser);
    setSession(true);
    setUser(newUser);
  };

  const login: AuthContextValue["login"] = async (email, password) => {
    const stored = loadUser();
    const ok =
      stored &&
      stored.email === email.trim().toLowerCase() &&
      (await verifyPassword(password, stored.passwordHash, stored.salt));
    if (!stored || !ok) throw new Error("Correo o contraseña incorrectos");
    setSession(true);
    setUser(stored);
  };

  const logout = () => {
    setSession(false);
    setUser(null);
  };

  const updateBalance = (newBalance: number) => {
    if (!user) return;
    const updated = { ...user, balance: newBalance };
    saveUser(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}