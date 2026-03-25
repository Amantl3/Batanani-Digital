import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type RegionData = {
  region: string;
  complaints: number;
  trend?: string;
  color?: string;
};

const regionCoords: Record<string, { lat: number; lng: number }> = {
  Gaborone:    { lat: -24.6282, lng: 25.9231 },
  Francistown: { lat: -21.17,   lng: 27.507  },
  Maun:        { lat: -19.9833, lng: 23.4167 },
  Serowe:      { lat: -22.3833, lng: 26.7167 },
  Kanye:       { lat: -24.9833, lng: 25.35   },
  Mochudi:     { lat: -24.4167, lng: 26.15   },
};

const botswanaBounds: [[number, number], [number, number]] = [
  [-27.0, 19.0],
  [-17.5, 30.0],
];

export default function ComplaintsMap({
  data,
  onRegionSelect,
}: {
  data: RegionData[];
  onRegionSelect?: (region: string) => void;
}) {
  if (data.length === 0) return null;

  const maxComplaints = Math.max(...data.map(d => d.complaints));

  return (
    <div>
      <MapContainer
        center={[-22.3285, 24.6849]}
        zoom={6}
        style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}
        maxBounds={botswanaBounds}
        maxBoundsViscosity={0.8}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {data.map((item, i) => {
          const coords = regionCoords[item.region];
          if (!coords) return null;

          const radius = (item.complaints / maxComplaints) * 25 + 5;
          const color = item.color ?? `hsl(${120 - (item.complaints / maxComplaints) * 120}, 100%, 50%)`;

          return (
            <CircleMarker
              key={i}
              center={[coords.lat, coords.lng]}
              radius={radius}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 1 }}
              eventHandlers={{
                click: () => onRegionSelect?.(item.region),
              }}
            >
              <Popup className="rounded-lg p-2 shadow-lg bg-white text-gray-800 font-medium">
                {item.region}: {item.complaints} complaints
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="flex items-center gap-2 mt-4 text-sm">
        <div className="h-3 w-32 rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500"></div>
        <span className="text-gray-700">Low → High complaints</span>
      </div>
    </div>
  );
}
