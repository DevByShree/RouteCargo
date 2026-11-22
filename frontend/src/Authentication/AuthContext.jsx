import { useCallback, useEffect, useMemo, useState } from "react";
import { authAPI } from "../API/api";
import { AuthContext } from "./authContext";

const SESSION_HINT_KEY = "routecargo.session";

function shouldSkipSignupRefresh() {
  if (typeof window === "undefined" || window.location.pathname !== "/signup") return false;
  try {
    return localStorage.getItem(SESSION_HINT_KEY) !== "1";
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !shouldSkipSignupRefresh());

  useEffect(() => {
    let active = true;
    try {
      // Remove credentials from the previous localStorage-based implementation.
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    } catch {
      // Storage may be unavailable; cookies remain the source of auth state.
    }

    const clearUser = () => {
      if (active) setUser(null);
      try { localStorage.removeItem(SESSION_HINT_KEY); } catch { /* Ignore unavailable storage. */ }
    };
    window.addEventListener("routecargo:auth-expired", clearUser);

    if (shouldSkipSignupRefresh()) {
      return () => {
        active = false;
        window.removeEventListener("routecargo:auth-expired", clearUser);
      };
    }

    const restore = async () => {
      let retry = 0;
      while (active) {
        try {
          const result = await authAPI.refresh();
          if (!active) return;
          setUser(result.user || null);
          try { localStorage.setItem(SESSION_HINT_KEY, "1"); } catch { /* Cookie session still works. */ }
          return;
        } catch (error) {
          if (!active) return;
          if ([401, 403].includes(error.status)) {
            setUser(null);
            try { localStorage.removeItem(SESSION_HINT_KEY); } catch { /* Ignore unavailable storage. */ }
            return;
          }
          // Keep protected routes in their restoring state while connectivity
          // or the API is unavailable. Do not turn a transient failure into a
          // logout; retry with a capped delay until the session is resolved.
          const delay = Math.min(1000 * (2 ** Math.min(retry, 5)), 30000);
          retry += 1;
          await new Promise((resolve) => window.setTimeout(resolve, delay));
        }
      }
    };

    restore().finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      window.removeEventListener("routecargo:auth-expired", clearUser);
    };
  }, []);

  const signIn = useCallback((authenticatedUser) => {
    try { localStorage.setItem(SESSION_HINT_KEY, "1"); } catch { /* Cookie session still works. */ }
    setUser(authenticatedUser);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((current) => current ? { ...current, ...updates } : current);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authAPI.signout();
    } finally {
      try { localStorage.removeItem(SESSION_HINT_KEY); } catch { /* Ignore unavailable storage. */ }
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, updateUser }),
    [user, loading, signIn, signOut, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
