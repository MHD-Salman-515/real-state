// src/pages/client/Profile.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";
import api, { extractApiErrorMessage } from "../../api/axios";
import { useNotifications } from "@/components/notifications/useNotifications";

function sanitizePhoneInput(value) {
  const source = String(value || "").replace(/\s+/g, " ").trimStart();
  const keepPlus = source.startsWith("+");
  const core = source.replace(/[^\d\s+]/g, "").replace(/\+/g, "");
  const compact = core.replace(/\s{2,}/g, " ").trim();
  return keepPlus ? `+${compact}` : compact;
}

export default function Profile() {
  const { updateUser } = useAuth();
  const { notify } = useNotifications();
  const [me, setMe] = useState({ fullName: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("auth_user_v1");
    if (!raw) return;
    try {
      const u = JSON.parse(raw);
      setUserId(u.id);
      setMe({
        fullName: u.fullName || "",
        phone: u.phone || "",
      });
    } catch {
      // Keep defaults if storage payload is invalid.
    }
  }, []);

  const save = async () => {
    setSaveError("");

    const fullName = String(me.fullName || "").trim();
    const phone = sanitizePhoneInput(me.phone);

    if (!fullName) {
      setSaveError("Please enter your full name.");
      return;
    }

    if (!userId) {
      setSaveError("Unable to detect your user account id.");
      return;
    }

    try {
      setLoading(true);
      const { data: updated } = await api.put(`/users/${userId}`, {
        fullName,
        phone,
      });

      const rawUser = localStorage.getItem("auth_user_v1");
      const currentUser = rawUser ? JSON.parse(rawUser) : {};
      const mergedUser = {
        ...currentUser,
        ...updated,
        fullName: updated?.fullName ?? fullName,
        phone: updated?.phone ?? phone,
      };

      localStorage.setItem("auth_user_v1", JSON.stringify(mergedUser));
      updateUser(mergedUser);
      setMe({ fullName: mergedUser.fullName || "", phone: mergedUser.phone || "" });

      notifyCrudSuccess("Your profile info was saved.", "Profile updated", {
        href: "/client/profile",
      });
      notify({
        type: "system",
        title: "Profile updated",
        message: "Your changes were saved successfully.",
      });
    } catch (err) {
      const message = extractApiErrorMessage(err, "Failed to save profile.");
      setSaveError(message);
      notifyCrudError(message, "Profile update failed", { href: "/client/profile" });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSaveError("");
    setMe({ fullName: "", phone: "" });
  };

  const inputCls =
    "w-full rounded-xl bg-slate-950/70 border border-white/15 " +
    "px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent";

  return (
    <section className="relative z-10 max-w-3xl mx-auto px-4 lg:px-0 py-10">
      <div className="card-glass border border-white/15 rounded-2xl p-5 md:p-6 shadow-soft space-y-5">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Profile</h1>
          <p className="text-sm text-slate-300">Update your contact information and profile details.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Full name</label>
            <input
              className={inputCls}
              placeholder="Example: Alex Morgan"
              value={me.fullName}
              onChange={(e) => setMe((prev) => ({ ...prev, fullName: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
            <input
              className={inputCls}
              placeholder="Example: +1 555 123 4567"
              value={me.phone}
              onChange={(e) =>
                setMe((prev) => ({
                  ...prev,
                  phone: sanitizePhoneInput(e.target.value),
                }))
              }
            />
          </div>
        </div>

        {saveError ? (
          <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {saveError}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-white/10 text-sm font-semibold text-black shadow-lg shadow-white/10 hover:bg-white/10 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={reset}
            className="px-4 py-2.5 rounded-xl border border-slate-500/60 text-sm text-slate-200 hover:bg-white/5 transition"
          >
            Reset
          </button>

          {(me.fullName || me.phone) && (
            <span className="text-[11px] text-slate-400">Your profile is saved to the server.</span>
          )}
        </div>
      </div>
    </section>
  );
}
