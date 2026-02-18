import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import GlassCard from './GlassCard';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon issue with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapWidget = ({ locations }) => {
    const { isDarkMode } = useTheme();
    const { environmentalMode } = useEnvironment();

    // Default center (San Francisco as placeholder)
    const position = [37.7749, -122.4194];

    // Premium Map Tiles
    const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    const lightTiles = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    // Eco Mode Tiles (Stamen Terrain or similar if available, otherwise Light)
    // CartoDB Voyager is good for Eco mode (colorful but clean).
    const ecoTiles = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    const tileUrl = environmentalMode && !isDarkMode
        ? ecoTiles
        : (isDarkMode ? darkTiles : lightTiles);

    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    return (
        <GlassCard className="h-[400px] w-full relative overflow-hidden p-0">
            <div className="absolute top-4 left-4 z-[400] bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-xs font-bold text-white shadow-lg pointer-events-none">
                Interactive Map
            </div>

            <MapContainer
                center={position}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                className="z-0"
            >
                <TileLayer
                    attribution={attribution}
                    url={tileUrl}
                />

                {/* Example Marker */}
                <Marker position={position}>
                    <Popup className="custom-popup">
                        <div className="p-1 text-center">
                            <b className="text-emerald-600 block mb-1">Your Location</b>
                            <span className="text-gray-600 text-xs">AQI: 42 (Good)</span>
                        </div>
                    </Popup>
                </Marker>

                {locations && locations.map((loc, idx) => (
                    <Marker key={idx} position={[position[0] + (Math.random() - 0.5) * 0.05, position[1] + (Math.random() - 0.5) * 0.05]}>
                        <Popup>
                            <div className="p-1">
                                <b className="text-gray-800">{loc.title}</b>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </GlassCard>
    );
};

export default MapWidget;
