import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NOMINATIM_URL = (lat, lon) =>
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

const STATIC_MAP_URL = (lat, lon) =>
  `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=600x300&markers=${lat},${lon},red-pushpin`;

export default function MapPickerPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const mode = searchParams.get("mode");
  const returnTo = searchParams.get("returnTo");
  const isChatMode = mode === "chat";

  const extractCity = (data) =>
    data?.address?.city ||
    data?.address?.town ||
    data?.address?.village ||
    data?.address?.state_district ||
    data?.address?.state ||
    "";

  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const r = await fetch(NOMINATIM_URL(lat, lon), {
        headers: { "Accept-Language": "ar" },
      });
      const data = await r.json();
      return {
        address: data.display_name || `${lat}, ${lon}`,
        city: extractCity(data),
      };
    } catch {
      return {
        address: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        city: "",
      };
    }
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setStatus(t("Browser does not support location detection."));
      return;
    }
    setStatus(t("Detecting your location..."));
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        setManualLat(String(lat));
        setManualLon(String(lon));
        setStatus("");
        const next = await reverseGeocode(lat, lon);
        setAddress(next.address);
      },
      () => setStatus(t("Unable to access location. Check browser permissions.")),
      { timeout: 10000 }
    );
  };

  const applyManual = async () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon)) {
      setStatus(t("Invalid coordinates."));
      return;
    }
    setStatus("");
    setCoords({ lat, lon });
    const next = await reverseGeocode(lat, lon);
    setAddress(next.address);
  };

  const confirm = async () => {
    if (!coords) return;
    const next = await reverseGeocode(coords.lat, coords.lon);
    const picked = {
      lat: coords.lat,
      lng: coords.lon,
      lon: coords.lon,
      address: next.address || address,
      city: next.city || "",
      text: `${next.address || address || `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`} (${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)})`,
    };
    try {
      localStorage.setItem(isChatMode ? "creos_chat_map_pick" : "creos_map_pick", JSON.stringify(picked));
    } catch {}
    if (isChatMode) {
      navigate(returnTo && returnTo.startsWith("/") ? returnTo : "/owner/chat");
      return;
    }
    navigate(-1);
  };

  return (
    <div dir={i18n.dir()} className="flex min-h-screen flex-col bg-[#0d0d0d] text-white">
      {/* Header */}
      <header
        className="flex items-center justify-between border-b border-white/10 bg-[#111] px-4 py-3"
      >
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-white/60 transition hover:text-white"
        >
          {i18n.dir() === "rtl" ? "← " : "→ "}
          {t("Back")}
        </button>
        <h1
          className="font-bold text-[#D4AF37]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {isChatMode ? t("Choose location for chat") : t("Choose location")}
        </h1>
        <button
          onClick={confirm}
          disabled={!coords}
          className="px-4 py-2 text-sm font-bold transition disabled:opacity-40"
          style={{ background: "#D4AF37", color: "#1b1c1c" }}
        >
          {isChatMode ? t("Use this location") : t("Confirm location")}
        </button>
      </header>

      <div className="mx-auto w-full max-w-xl flex-1 space-y-5 p-6">
        {/* Use location button */}
        <button
          onClick={useMyLocation}
          className="w-full py-3 text-sm font-bold transition"
          style={{ border: "0.5px solid rgba(212,175,55,0.5)", color: "#D4AF37" }}
        >
          {t("Use my current location")}
        </button>

        {status && (
          <p className="text-center text-sm text-white/40">{status}</p>
        )}

        {/* Manual coordinates */}
        <div className="space-y-2">
          <p className="text-right text-xs text-white/50">{t("Or enter coordinates manually")}</p>
          <div className="flex gap-2">
            <input
              value={manualLon}
              onChange={e => setManualLon(e.target.value)}
              placeholder={t("Longitude")}
              className="flex-1 px-3 py-2 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(212,175,55,0.2)",
                color: "#fff",
              }}
            />
            <input
              value={manualLat}
              onChange={e => setManualLat(e.target.value)}
              placeholder={t("Latitude")}
              className="flex-1 px-3 py-2 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(212,175,55,0.2)",
                color: "#fff",
              }}
            />
          </div>
          <button
            onClick={applyManual}
            className="w-full py-2 text-sm transition"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              color: "#fff",
            }}
          >
            {t("Apply coordinates")}
          </button>
        </div>

        {/* Map preview */}
        {coords && (
          <div className="space-y-3">
            <img
              src={STATIC_MAP_URL(coords.lat, coords.lon)}
              alt="map preview"
              className="w-full"
              style={{ border: "0.5px solid rgba(212,175,55,0.3)" }}
            />
            {address && (
              <div
                className="p-3 text-right text-sm text-white/80"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "0.5px solid rgba(212,175,55,0.15)",
                }}
              >
                <p className="mb-1 text-xs text-[#D4AF37]">{t("Selected address")}</p>
                {address}
              </div>
            )}
            <div className="flex gap-2 text-xs text-white/30">
              <span>{t("Latitude")}: {coords.lat.toFixed(6)}</span>
              <span>·</span>
              <span>{t("Longitude")}: {coords.lon.toFixed(6)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
