export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  balance: number;
}

const USER_KEY = "app:user";
const SESSION_KEY = "app:session";

export const loadUser = (): StoredUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
};
export const saveUser = (u: StoredUser) => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const isSessionActive = () => localStorage.getItem(SESSION_KEY) === "1";
export const setSession = (active: boolean) =>
  active ? localStorage.setItem(SESSION_KEY, "1") : localStorage.removeItem(SESSION_KEY);