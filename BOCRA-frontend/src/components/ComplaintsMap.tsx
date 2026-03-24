import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type RegionData = {
  region: 'Gaborone' | 'Francistown' | 'Maun';
  complaints: number;
};

const regionCoords: Record<string, { lat: number; lng: number }> = {
  Gaborone: { lat: -24.6282, lng: 25.9231 },
  Francistown: { lat: -21.17, lng: 27.507 },
  Maun: { lat: -19.9833, lng: 23.4167 },
};

// Botswana bounds (approximate)
const botswanaBounds: [[number, number], [number, number]] = [
  [-27.0, 19.0], // SW corner
  [-17.5, 30.0], // NE corner
];

export default function ComplaintsMap({ data }: { data: RegionData[] }) {
  if (data.length === 0) return null;

  const maxComplaints = Math.max(...data.map(d => d.complaints));

  return (
    <div>
      <MapContainer
        center={[-22.3285, 24.6849]} // Botswana center
        zoom={6}
        style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}
        maxBounds={botswanaBounds} // prevent panning outside
        maxBoundsViscosity={0.8}  // smooth boundary resistance
      >
        {/* Modern tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Heat circles */}
        {data.map((item, i) => {
          const coords = regionCoords[item.region];
          if (!coords) return null;

          const radius = (item.complaints / maxComplaints) * 25 + 5;
          const color = `hsl(${120 - (item.complaints / maxComplaints) * 120}, 100%, 50%)`;

          return (
            <CircleMarker
              key={i}
              center={[coords.lat, coords.lng]}
              radius={radius}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 1 }}
            >
              <Popup className="rounded-lg p-2 shadow-lg bg-white text-gray-800 font-medium">
                {item.region}: {item.complaints} complaints
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Gradient Legend */}
      <div className="flex items-center gap-2 mt-4 text-sm">
        <div className="h-3 w-32 rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500"></div>
        <span className="text-gray-700">Low → High complaints</span>
      </div>
    </div>
  );
}