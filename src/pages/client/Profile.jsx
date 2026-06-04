// src/pages/client/Profile.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setSaveError(t("Please enter your full name."));
      return;
    }

    if (!userId) {
      setSaveError(t("Unable to detect your user account id."));
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

      notifyCrudSuccess(t("Your profile info was saved."), t("Profile updated"), {
        href: "/client/profile",
      });
      notify({
        type: "system",
        title: t("Profile updated"),
        message: t("Your changes were saved successfully."),
      });
    } catch (err) {
      const message = extractApiErrorMessage(err, t("Failed to save profile."));
      setSaveError(message);
      notifyCrudError(message, t("Profile update failed"), { href: "/client/profile" });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSaveError("");
    setMe({ fullName: "", phone: "" });
  };

  const inputCls =
    "input-creos text-sm";

  return (
    <section className="creos-theme bg-luxury relative z-10 min-h-screen">
      <div className="section-shell max-w-3xl py-10">
      <div className="card-glass space-y-5 rounded-3xl p-5 md:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t("Profile")}</h1>
          <p className="text-sm text-[color:rgb(var(--creos-text-rgb)/0.74)]">{t("Update your contact information and profile details.")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          <div>
            <label className="mb-1.5 block text-xs text-[color:var(--creos-muted)]">{t("Full name")}</label>
            <input
              className={inputCls}
              placeholder={t("Example: Alex Morgan")}
              value={me.fullName}
              onChange={(e) => setMe((prev) => ({ ...prev, fullName: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-[color:var(--creos-muted)]">{t("Phone")}</label>
            <input
              className={inputCls}
              placeholder={t("Example: +1 555 123 4567")}
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
          <div className="rounded-2xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {saveError}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="btn-gold px-5 py-2.5 text-sm disabled:opacity-50"
          >
            {loading ? t("Saving...") : t("Save")}
          </button>

          <button
            type="button"
            onClick={reset}
            className="btn-glass px-4 py-2.5 text-sm"
          >
            {t("Reset")}
          </button>

          {(me.fullName || me.phone) && (
            <span className="text-[11px] text-[color:var(--creos-muted)]">{t("Your profile is saved to the server.")}</span>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}
