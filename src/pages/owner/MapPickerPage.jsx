import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const NOMINATIM_URL = (lat, lon) =>
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

const STATIC_MAP_URL = (lat, lon) =>
  `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=600x300&markers=${lat},${lon},red-pushpin`;

export default function MapPickerPage() {
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");

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
      setStatus("المتصفح لا يدعم تحديد الموقع");
      return;
    }
    setStatus("جاري تحديد موقعك...");
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
      () => setStatus("تعذّر الوصول إلى الموقع — تحقق من صلاحيات المتصفح"),
      { timeout: 10000 }
    );
  };

  const applyManual = async () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon)) {
      setStatus("إحداثيات غير صالحة");
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
    try {
      localStorage.setItem(
        "creos_map_pick",
        JSON.stringify({
          lat: coords.lat,
          lng: coords.lon,
          lon: coords.lon,
          address: next.address || address,
          city: next.city || "",
        })
      );
    } catch {}
    navigate(-1);
  };

  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-[#0d0d0d]">
      {/* Header */}
      <header
        className="flex items-center justify-between border-b border-white/10 bg-[#111] px-4 py-3"
      >
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-white/60 transition hover:text-white"
        >
          → رجوع
        </button>
        <h1
          className="font-bold text-[#D4AF37]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          اختر الموقع
        </h1>
        <button
          onClick={confirm}
          disabled={!coords}
          className="px-4 py-2 text-sm font-bold transition disabled:opacity-40"
          style={{ background: "#D4AF37", color: "#1b1c1c" }}
        >
          تأكيد الموقع
        </button>
      </header>

      <div className="mx-auto w-full max-w-xl flex-1 space-y-5 p-6">
        {/* Use location button */}
        <button
          onClick={useMyLocation}
          className="w-full py-3 text-sm font-bold transition"
          style={{ border: "0.5px solid rgba(212,175,55,0.5)", color: "#D4AF37" }}
        >
          📍 استخدم موقعي الحالي
        </button>

        {status && (
          <p className="text-center text-sm text-white/40">{status}</p>
        )}

        {/* Manual coordinates */}
        <div className="space-y-2">
          <p className="text-right text-xs text-white/50">أو أدخل الإحداثيات يدوياً</p>
          <div className="flex gap-2">
            <input
              value={manualLon}
              onChange={e => setManualLon(e.target.value)}
              placeholder="خط الطول"
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
              placeholder="خط العرض"
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
            تطبيق الإحداثيات
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
                <p className="mb-1 text-xs text-[#D4AF37]">العنوان المحدد</p>
                {address}
              </div>
            )}
            <div className="flex gap-2 text-xs text-white/30">
              <span>خط العرض: {coords.lat.toFixed(6)}</span>
              <span>·</span>
              <span>خط الطول: {coords.lon.toFixed(6)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
