import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api, { AUTH_ME_PATH, extractApiErrorMessage } from "../../api/axios";

function roleDestination(role) {
  const normalized = String(role || "client").toLowerCase();
  return (
    {
      owner: "/owner",
      admin: "/admin",
      accountant: "/accountant",
      supplier: "/supplier",
      worker: "/worker",
      client: "/",
    }[normalized] || "/"
  );
}

export default function OAuthCallback() {
  const nav = useNavigate();
  const { hydrateAuth } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token") || params.get("accessToken");

      if (!token) {
        setError("OAuth token is missing.");
        return;
      }

      try {
        const res = await api.get(AUTH_ME_PATH, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data;

        if (!user) {
          throw new Error("Unable to load user profile.");
        }

        hydrateAuth(token, user);
        nav(roleDestination(user.role), { replace: true });
      } catch (err) {
        setError(extractApiErrorMessage(err, "OAuth login failed."));
      }
    };

    run();
  }, [hydrateAuth, nav]);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-black/60 p-6 text-center text-white shadow-2xl backdrop-blur-sm">
      {!error ? <p className="text-white/80">Completing OAuth sign-in...</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}
    </div>
  );
}
