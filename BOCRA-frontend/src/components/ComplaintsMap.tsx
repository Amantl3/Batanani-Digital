import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Coordinates for major Botswana regions
const REGION_COORDS: Record<string, [number, number]> = {
  'Gaborone': [-24.6282, 25.9231],
  'Francistown': [-21.1661, 27.5144],
  'Maun': [-19.9833, 23.4167],
  'Kanye': [-24.9667, 25.3333],
  'Molepolole': [-24.4167, 25.5333],
  'Serowe': [-22.3833, 26.7167],
  'Kasane': [-17.8167, 25.1500],
  'Ghanzi': [-21.5667, 21.7833],
}

interface MapProps {
  // Added 'id' or fallback to ensure unique keys
  data: { id?: string; region: string; complaints: number }[]
}

export default function ComplaintsMap({ data }: MapProps) {
  const center: [number, number] = [-22.3285, 24.6849]

  return (
    <MapContainer 
      center={center} 
      zoom={6} 
      className="h-full w-full z-0 rounded-xl overflow-hidden"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {data.map((item, index) => {
        const coords = REGION_COORDS[item.region] || REGION_COORDS['Gaborone']
        
        // FIX: Use item.id if available, otherwise combine region + index to guarantee uniqueness
        const uniqueKey = item.id || `${item.region}-${index}`;
        
        return (
          <CircleMarker
            key={uniqueKey}
            center={coords}
            radius={Math.max(10, Math.min(item.complaints * 5, 40))} // Ensure a minimum visible size
            pathOptions={{
              fillColor: '#ef4444',
              color: '#b91c1c',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.6,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]} className="bg-transparent border-none shadow-none font-bold text-red-700">
              {item.complaints}
            </Tooltip>
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-slate-900">{item.region}</h4>
                <p className="text-sm text-slate-600">{item.complaints} Active Complaints</p>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}