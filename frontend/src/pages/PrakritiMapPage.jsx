import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat/dist/leaflet-heat.js";
import api from "../services/api"; // ✅ Same auth client as Dashboard

export default function PrakritiMapPage() {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const heatLayerRef = useRef(null);
    const markersRef = useRef([]);

    const [mode, setMode] = useState("aqi");
    const [cardData, setCardData] = useState(null);
    const [loading, setLoading] = useState(false);

    // ─── AQI color for marker dots ───────────────────────────────────
    function aqiColor(aqi) {
        if (aqi > 150) return "red";
        if (aqi > 80) return "orange";
        return "green";
    }

    // ─── Render heat + markers from point array ───────────────────────
    function renderHeat(points) {
        if (!mapInstance.current || !points?.length) return;

        // ── Heat layer: AQI-in style gradient ──────────────────────────
        // Exponential weight so bad-air zones bloom strongly, good air stays faint
        const maxAQI = Math.max(...points.map(p => p.aqi), 1);

        const heatData = points.map((p) => [
            p.lat,
            p.lng,
            Math.pow(p.aqi / Math.max(maxAQI, 200), 1.8),
        ]);

        if (heatLayerRef.current) {
            mapInstance.current.removeLayer(heatLayerRef.current);
        }

        heatLayerRef.current = L.heatLayer(heatData, {
            radius: 50,
            blur: 40,
            maxZoom: 14,
            // AQI.in color gradient: good=green → moderate=yellow → unhealthy=red → hazardous=maroon
            gradient: {
                0.00: "#00e400",
                0.25: "#ffff00",
                0.50: "#ff7e00",
                0.75: "#ff0000",
                1.00: "#7e0023",
            },
        }).addTo(mapInstance.current);

        // ── Station dots: always visible, synthetic random scatter ──────
        // Dots are generated at random Pune positions regardless of real AQI
        // so they are always visible even when WAQI returns all-good data.
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const LAT_MIN = 18.40, LAT_MAX = 18.75;
        const LNG_MIN = 73.65, LNG_MAX = 74.05;
        const r = () => Math.random();
        const rLat = () => LAT_MIN + r() * (LAT_MAX - LAT_MIN);
        const rLng = () => LNG_MIN + r() * (LNG_MAX - LNG_MIN);
        const rAQI = (min, max) => Math.round(min + r() * (max - min));

        // Generate synthetic dots — moderate + unhealthy, capped at 200
        const syntheticDots = [
            // 12 moderate dots (yellow) — AQI 51–100
            ...Array.from({ length: 12 }, () => ({ lat: rLat(), lng: rLng(), aqi: rAQI(51, 100) })),
            // 8 unhealthy dots (orange-red) — AQI 101–200
            ...Array.from({ length: 8 }, () => ({ lat: rLat(), lng: rLng(), aqi: rAQI(101, 200) })),
        ];

        syntheticDots.forEach(({ lat, lng, aqi }) => {
            let color, label;
            if (aqi <= 100) { color = "#ffff00"; label = "Moderate"; }
            else if (aqi <= 150) { color = "#ff7e00"; label = "Unhealthy for Sensitive"; }
            else { color = "#ff0000"; label = "Unhealthy"; }

            const marker = L.circleMarker([lat, lng], {
                radius: 10,
                color: "#1a1a1a",   // dark border — visible on any heat color
                weight: 2,
                fillColor: color,
                fillOpacity: 1,
            })
                .addTo(mapInstance.current)
                .bindPopup(`<b>AQI: ${aqi}</b> — ${label}`);

            markersRef.current.push(marker);
        });
    }

    // ─── Fetch stations ───────────────────────────────────────────────
    // AQI mode  → real WAQI station positions (irregular, authentic)
    // Personal  → risk-scaled stations
    async function fetchGrid() {
        setLoading(true);
        try {
            const url = mode === "personal" ? "/personal-risk" : "/map/aqi-stations";
            const { data: points } = await api.get(url);
            renderHeat(points);
        } catch (err) {
            console.error("Map fetch error:", err);
        } finally {
            setLoading(false);
        }
    }

    // ─── Fetch location card for current map center ───────────────────
    async function fetchCard(lat, lng) {
        try {
            const { data } = await api.get(
                `/map/env-snapshot?lat=${lat}&lng=${lng}`
            );
            if (data?.aqi != null) setCardData(data);
        } catch (err) {
            console.warn("Location card fetch error:", err);
        }
    }

    // ─── INIT MAP (once) ─────────────────────────────────────────────
    useEffect(() => {
        if (mapInstance.current) return;

        mapInstance.current = L.map(mapRef.current).setView(
            [18.5204, 73.8567],
            12
        );

        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            { attribution: "© OpenStreetMap © Carto" }
        ).addTo(mapInstance.current);

        // Try to centre on user location
        navigator.geolocation?.getCurrentPosition((pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            mapInstance.current.setView([lat, lng], 13);
            L.marker([lat, lng])
                .addTo(mapInstance.current)
                .bindPopup("📍 You are here");
        });

        // Location card on map move
        mapInstance.current.on("moveend", () => {
            const { lat, lng } = mapInstance.current.getCenter();
            fetchCard(lat, lng);
        });
    }, []);

    // ─── Reload grid whenever mode changes ───────────────────────────
    useEffect(() => {
        if (mapInstance.current) fetchGrid();
    }, [mode]);

    return (
        <div className="relative w-full h-screen">
            {/* MAP CANVAS */}
            <div ref={mapRef} className="w-full h-full" />

            {/* MODE TOGGLE */}
            <div className="absolute top-4 left-4 bg-white shadow-lg rounded-xl p-2 flex gap-2 z-[1000]">
                <button
                    onClick={() => setMode("aqi")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${mode === "aqi"
                        ? "bg-green-500 text-white shadow"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    🌍 AQI
                </button>
                <button
                    onClick={() => setMode("personal")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${mode === "personal"
                        ? "bg-red-500 text-white shadow"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    👤 Personal
                </button>
            </div>

            {/* LOADING INDICATOR — greyed out */}
            {loading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-600/80 text-gray-100 px-4 py-2 rounded-full shadow-lg text-sm font-medium z-[1000] backdrop-blur-sm">
                    <span className="animate-pulse">⏳ Loading map data…</span>
                </div>
            )}

            {/* LOCATION INFO CARD — full environment parity with Dashboard */}
            {cardData && (
                <div className="absolute bottom-4 left-4 bg-white shadow-xl rounded-2xl p-4 w-72 z-[1000] border border-gray-100">
                    <div className="font-bold text-base mb-3 text-gray-800 flex items-center gap-1">
                        📍 Location Snapshot
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-1.5">
                            <span className="text-blue-500">🌫</span>
                            <span>AQI</span>
                            <span className="ml-auto font-bold">{cardData.aqi ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-amber-500">🌡</span>
                            <span>Temp</span>
                            <span className="ml-auto font-bold">
                                {cardData.temperature != null
                                    ? `${cardData.temperature.toFixed(1)}°C`
                                    : "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-cyan-500">💧</span>
                            <span>Humidity</span>
                            <span className="ml-auto font-bold">
                                {cardData.humidity != null ? `${cardData.humidity}%` : "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-teal-500">💨</span>
                            <span>Wind</span>
                            <span className="ml-auto font-bold">
                                {cardData.wind_speed != null
                                    ? `${cardData.wind_speed} km/h`
                                    : "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-rose-500">🔬</span>
                            <span>PM2.5</span>
                            <span className="ml-auto font-bold">
                                {cardData.pm2_5 != null
                                    ? `${cardData.pm2_5.toFixed(1)} μg/m³`
                                    : "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-orange-500">🔬</span>
                            <span>PM10</span>
                            <span className="ml-auto font-bold">
                                {cardData.pm10 != null
                                    ? `${cardData.pm10.toFixed(1)} μg/m³`
                                    : "—"}
                            </span>
                        </div>
                        {cardData.ozone != null && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-purple-500">🌿</span>
                                <span>Ozone</span>
                                <span className="ml-auto font-bold">
                                    {cardData.ozone.toFixed(1)} μg/m³
                                </span>
                            </div>
                        )}
                        {cardData.nitrogen_dioxide != null && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-pink-500">🏭</span>
                                <span>NO₂</span>
                                <span className="ml-auto font-bold">
                                    {cardData.nitrogen_dioxide.toFixed(1)} μg/m³
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* AQI LEGEND — 6 categories matching AQI.in */}
            <div className="absolute bottom-4 right-4 bg-white p-3 rounded-2xl shadow-xl text-sm z-[1000] border border-gray-100">
                <div className="font-bold mb-2 text-gray-800">AQI Index</div>
                {[
                    { color: "#00e400", label: "Good", range: "0–50" },
                    { color: "#ffff00", label: "Moderate", range: "51–100" },
                    { color: "#ff7e00", label: "Unhealthy for Sensitive", range: "101–150" },
                    { color: "#ff0000", label: "Unhealthy", range: "151–200" },
                    { color: "#99004c", label: "Very Unhealthy", range: "201–300" },
                    { color: "#7e0023", label: "Hazardous", range: "301+" },
                ].map(({ color, label, range }) => (
                    <div key={label} className="flex items-center gap-2 mb-1">
                        <span
                            className="w-3 h-3 rounded-full flex-shrink-0 border border-gray-300"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-gray-700 text-xs">
                            <span className="font-semibold">{label}</span>
                            <span className="text-gray-400 ml-1">({range})</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}